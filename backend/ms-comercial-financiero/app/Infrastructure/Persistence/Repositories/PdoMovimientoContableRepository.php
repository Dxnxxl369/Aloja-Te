<?php

namespace App\Infrastructure\Persistence\Repositories;

use App\Domain\Entities\MovimientoContable;
use App\Domain\Enums\TipoMovimientoContable;
use App\Domain\Repositories\MovimientoContableRepositoryInterface;
use App\Infrastructure\Persistence\PdoDatabase;
use PDO;
use DateTimeImmutable;

class PdoMovimientoContableRepository implements MovimientoContableRepositoryInterface
{
    private PDO $db;

    public function __construct()
    {
        $this->db = PdoDatabase::getInstance();
    }

    public function guardar(MovimientoContable $movimiento): void
    {
        $stmt = $this->db->prepare("INSERT INTO movimientos_contables 
            (asiento_id, cuenta, tipo, monto, origen_tipo, origen_id, created_at)
            VALUES (:asiento, :cuenta, :tipo, :monto, :origen_tipo, :origen_id, :created)");
        
        $stmt->execute([
            'asiento' => $movimiento->getAsientoId(),
            'cuenta' => $movimiento->getCuenta(),
            'tipo' => $movimiento->getTipo()->value,
            'monto' => $movimiento->getMonto(),
            'origen_tipo' => $movimiento->getOrigenTipo(),
            'origen_id' => $movimiento->getOrigenId(),
            'created' => $movimiento->getCreatedAt()->format('Y-m-d H:i:s')
        ]);
    }

    public function listarPorAsiento(string $asientoId): array
    {
        $stmt = $this->db->prepare("SELECT * FROM movimientos_contables WHERE asiento_id = :asiento ORDER BY movimiento_id ASC");
        $stmt->execute(['asiento' => $asientoId]);
        $rows = $stmt->fetchAll();
        return array_map([$this, 'mapRowToEntity'], $rows);
    }

    public function listarTodos(): array
    {
        $stmt = $this->db->query("SELECT * FROM movimientos_contables ORDER BY created_at DESC LIMIT 50");
        $rows = $stmt->fetchAll();
        return array_map([$this, 'mapRowToEntity'], $rows);
    }

    private function mapRowToEntity(array $row): MovimientoContable
    {
        return new MovimientoContable(
            asientoId: $row['asiento_id'],
            cuenta: $row['cuenta'],
            tipo: TipoMovimientoContable::from($row['tipo']),
            monto: (float) $row['monto'],
            origenTipo: $row['origen_tipo'],
            origenId: $row['origen_id'],
            movimientoId: (int) $row['movimiento_id'],
            createdAt: new DateTimeImmutable($row['created_at'])
        );
    }
}
