<?php

namespace App\Infrastructure\Persistence\Repositories;

use App\Domain\Entities\Comision;
use App\Domain\Repositories\ComisionRepositoryInterface;
use App\Infrastructure\Persistence\PdoDatabase;
use PDO;
use DateTimeImmutable;

class PdoComisionRepository implements ComisionRepositoryInterface
{
    private PDO $db;

    public function __construct()
    {
        $this->db = PdoDatabase::getInstance();
    }

    public function guardar(Comision $comision): void
    {
        $stmt = $this->db->prepare("INSERT OR REPLACE INTO comisiones 
            (comision_id, pago_id, regla_id, liquidacion_id, base_comisionable, porcentaje_aplicado, monto_comision, monto_neto_anfitrion, estado, created_at)
            VALUES (:id, :pago, :regla, :liq, :base, :porc, :monto_com, :monto_neto, :estado, :created)");
        
        $stmt->execute([
            'id' => $comision->getComisionId(),
            'pago' => $comision->getPagoId(),
            'regla' => $comision->getReglaId(),
            'liq' => $comision->getLiquidacionId(),
            'base' => $comision->getBaseComisionable(),
            'porc' => $comision->getPorcentajeAplicado(),
            'monto_com' => $comision->getMontoComision(),
            'monto_neto' => $comision->getMontoNetoAnfitrion(),
            'estado' => $comision->getEstado(),
            'created' => $comision->getCreatedAt()->format('Y-m-d H:i:s')
        ]);
    }

    public function buscarPorId(string $comisionId): ?Comision
    {
        $stmt = $this->db->prepare("SELECT * FROM comisiones WHERE comision_id = :id");
        $stmt->execute(['id' => $comisionId]);
        $row = $stmt->fetch();
        return $row ? $this->mapRowToEntity($row) : null;
    }

    public function buscarPorPagoId(string $pagoId): ?Comision
    {
        $stmt = $this->db->prepare("SELECT * FROM comisiones WHERE pago_id = :id");
        $stmt->execute(['id' => $pagoId]);
        $row = $stmt->fetch();
        return $row ? $this->mapRowToEntity($row) : null;
    }

    public function listarPendientesPorAnfitrion(string $anfitrionId): array
    {
        $stmt = $this->db->prepare("SELECT c.* FROM comisiones c 
            JOIN pagos p ON c.pago_id = p.pago_id
            WHERE p.anfitrion_id = :anfitrion AND c.estado = 'PENDIENTE'
            ORDER BY c.created_at ASC");
        $stmt->execute(['anfitrion' => $anfitrionId]);
        $rows = $stmt->fetchAll();
        return array_map([$this, 'mapRowToEntity'], $rows);
    }

    private function mapRowToEntity(array $row): Comision
    {
        return new Comision(
            comisionId: $row['comision_id'],
            pagoId: $row['pago_id'],
            reglaId: $row['regla_id'],
            baseComisionable: (float) $row['base_comisionable'],
            porcentajeAplicado: (float) $row['porcentaje_aplicado'],
            liquidacionId: $row['liquidacion_id'],
            estado: $row['estado'],
            createdAt: new DateTimeImmutable($row['created_at'])
        );
    }
}
