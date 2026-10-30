<?php

namespace App\Infrastructure\Persistence\Repositories;

use App\Domain\Entities\Pago;
use App\Domain\Entities\TransaccionPago;
use App\Domain\Entities\Comprobante;
use App\Domain\Entities\Reembolso;
use App\Domain\Enums\EstadoPago;
use App\Domain\Enums\TipoTransaccion;
use App\Domain\Enums\TipoComprobante;
use App\Domain\Enums\EstadoReembolso;
use App\Domain\Repositories\PagoRepositoryInterface;
use App\Infrastructure\Persistence\PdoDatabase;
use PDO;
use DateTimeImmutable;

class PdoPagoRepository implements PagoRepositoryInterface
{
    private PDO $db;

    public function __construct()
    {
        $this->db = PdoDatabase::getInstance();
    }

    public function guardar(Pago $pago): void
    {
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM pagos WHERE pago_id = :id");
        $stmt->execute(['id' => $pago->getPagoId()]);
        $existe = (int) $stmt->fetchColumn() > 0;

        if ($existe) {
            $update = $this->db->prepare("UPDATE pagos SET 
                descuento = :descuento,
                cargo_servicio = :cargo,
                monto_total = :total,
                estado = :estado,
                updated_at = :updated_at
                WHERE pago_id = :id");
            $update->execute([
                'id' => $pago->getPagoId(),
                'descuento' => $pago->getDescuento(),
                'cargo' => $pago->getCargoServicio(),
                'total' => $pago->getMontoTotal(),
                'estado' => $pago->getEstado()->value,
                'updated_at' => ($pago->getUpdatedAt() ?? new DateTimeImmutable())->format('Y-m-d H:i:s')
            ]);
        } else {
            $insert = $this->db->prepare("INSERT INTO pagos 
                (pago_id, reserva_id, anfitrion_id, promocion_id, subtotal_alojamiento, descuento, cargo_servicio, monto_total, estado, idempotency_key, saga_id, created_at, updated_at)
                VALUES (:id, :reserva, :anfitrion, :promo, :subtotal, :descuento, :cargo, :total, :estado, :idempotency, :saga, :created, :updated)");
            $insert->execute([
                'id' => $pago->getPagoId(),
                'reserva' => $pago->getReservaId(),
                'anfitrion' => $pago->getAnfitrionId(),
                'promo' => $pago->getPromocionId(),
                'subtotal' => $pago->getSubtotalAlojamiento(),
                'descuento' => $pago->getDescuento(),
                'cargo' => $pago->getCargoServicio(),
                'total' => $pago->getMontoTotal(),
                'estado' => $pago->getEstado()->value,
                'idempotency' => $pago->getIdempotencyKey(),
                'saga' => $pago->getSagaId(),
                'created' => ($pago->getCreatedAt() ?? new DateTimeImmutable())->format('Y-m-d H:i:s'),
                'updated' => ($pago->getUpdatedAt() ?? new DateTimeImmutable())->format('Y-m-d H:i:s')
            ]);
        }

        // Guardar transacciones
        foreach ($pago->getTransacciones() as $tx) {
            $stmtTx = $this->db->prepare("INSERT OR IGNORE INTO transacciones_pago 
                (transaccion_id, pago_id, tipo, monto, referencia_pasarela, created_at)
                VALUES (:id, :pago, :tipo, :monto, :ref, :created)");
            $stmtTx->execute([
                'id' => $tx->getTransaccionId(),
                'pago' => $tx->getPagoId(),
                'tipo' => $tx->getTipo()->value,
                'monto' => $tx->getMonto(),
                'ref' => $tx->getReferenciaPasarela(),
                'created' => $tx->getCreatedAt()->format('Y-m-d H:i:s')
            ]);
        }

        // Guardar comprobantes
        foreach ($pago->getComprobantes() as $comp) {
            $stmtComp = $this->db->prepare("INSERT OR IGNORE INTO comprobantes 
                (comprobante_id, pago_id, tipo, numero, created_at)
                VALUES (:id, :pago, :tipo, :numero, :created)");
            $stmtComp->execute([
                'id' => $comp->getComprobanteId(),
                'pago' => $comp->getPagoId(),
                'tipo' => $comp->getTipo()->value,
                'numero' => $comp->getNumero(),
                'created' => $comp->getCreatedAt()->format('Y-m-d H:i:s')
            ]);
        }

        // Guardar reembolsos
        foreach ($pago->getReembolsos() as $reemb) {
            $stmtReemb = $this->db->prepare("INSERT OR REPLACE INTO reembolsos 
                (reembolso_id, pago_id, monto, motivo, estado, created_at)
                VALUES (:id, :pago, :monto, :motivo, :estado, :created)");
            $stmtReemb->execute([
                'id' => $reemb->getReembolsoId(),
                'pago' => $reemb->getPagoId(),
                'monto' => $reemb->getMonto(),
                'motivo' => $reemb->getMotivo(),
                'estado' => $reemb->getEstado()->value,
                'created' => $reemb->getCreatedAt()->format('Y-m-d H:i:s')
            ]);
        }
    }

    public function buscarPorId(string $pagoId): ?Pago
    {
        $stmt = $this->db->prepare("SELECT * FROM pagos WHERE pago_id = :id");
        $stmt->execute(['id' => $pagoId]);
        $row = $stmt->fetch();
        return $row ? $this->mapRowToEntity($row) : null;
    }

    public function buscarPorReservaId(string $reservaId): ?Pago
    {
        $stmt = $this->db->prepare("SELECT * FROM pagos WHERE reserva_id = :id ORDER BY created_at DESC LIMIT 1");
        $stmt->execute(['id' => $reservaId]);
        $row = $stmt->fetch();
        return $row ? $this->mapRowToEntity($row) : null;
    }

    public function buscarPorIdempotencyKey(string $idempotencyKey): ?Pago
    {
        $stmt = $this->db->prepare("SELECT * FROM pagos WHERE idempotency_key = :k");
        $stmt->execute(['k' => $idempotencyKey]);
        $row = $stmt->fetch();
        return $row ? $this->mapRowToEntity($row) : null;
    }

    public function listarTodos(): array
    {
        $stmt = $this->db->query("SELECT * FROM pagos ORDER BY created_at DESC");
        $rows = $stmt->fetchAll();
        return array_map([$this, 'mapRowToEntity'], $rows);
    }

    private function mapRowToEntity(array $row): Pago
    {
        $pago = new Pago(
            pagoId: $row['pago_id'],
            reservaId: $row['reserva_id'],
            anfitrionId: $row['anfitrion_id'],
            subtotalAlojamiento: (float) $row['subtotal_alojamiento'],
            cargoServicio: (float) $row['cargo_servicio'],
            idempotencyKey: $row['idempotency_key'],
            sagaId: $row['saga_id'],
            promocionId: $row['promocion_id'],
            descuento: (float) $row['descuento'],
            estado: EstadoPago::from($row['estado']),
            createdAt: new DateTimeImmutable($row['created_at']),
            updatedAt: new DateTimeImmutable($row['updated_at'])
        );

        // Cargar comprobantes
        $stmtComp = $this->db->prepare("SELECT * FROM comprobantes WHERE pago_id = :id");
        $stmtComp->execute(['id' => $row['pago_id']]);
        foreach ($stmtComp->fetchAll() as $c) {
            $pago->emitirComprobante(
                $c['comprobante_id'],
                TipoComprobante::from($c['tipo']),
                $c['numero']
            );
        }

        return $pago;
    }
}
