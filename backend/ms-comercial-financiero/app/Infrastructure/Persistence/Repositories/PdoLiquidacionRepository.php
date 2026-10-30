<?php

namespace App\Infrastructure\Persistence\Repositories;

use App\Domain\Entities\Liquidacion;
use App\Domain\Enums\EstadoLiquidacion;
use App\Domain\Repositories\LiquidacionRepositoryInterface;
use App\Infrastructure\Persistence\PdoDatabase;
use PDO;
use DateTimeImmutable;

class PdoLiquidacionRepository implements LiquidacionRepositoryInterface
{
    private PDO $db;

    public function __construct()
    {
        $this->db = PdoDatabase::getInstance();
    }

    public function guardar(Liquidacion $liquidacion): void
    {
        $stmt = $this->db->prepare("INSERT OR REPLACE INTO liquidaciones 
            (liquidacion_id, anfitrion_id, metodo_id, periodo_desde, periodo_hasta, total_bruto, total_comisiones, total_neto, estado, created_at)
            VALUES (:id, :anfitrion, :metodo, :desde, :hasta, :bruto, :comisiones, :neto, :estado, :created)");
        
        $stmt->execute([
            'id' => $liquidacion->getLiquidacionId(),
            'anfitrion' => $liquidacion->getAnfitrionId(),
            'metodo' => $liquidacion->getMetodoId(),
            'desde' => $liquidacion->getPeriodoDesde()->format('Y-m-d H:i:s'),
            'hasta' => $liquidacion->getPeriodoHasta()->format('Y-m-d H:i:s'),
            'bruto' => $liquidacion->getTotalBruto(),
            'comisiones' => $liquidacion->getTotalComisiones(),
            'neto' => $liquidacion->getTotalNeto(),
            'estado' => $liquidacion->getEstado()->value,
            'created' => $liquidacion->getCreatedAt()->format('Y-m-d H:i:s')
        ]);
    }

    public function buscarPorId(string $liquidacionId): ?Liquidacion
    {
        $stmt = $this->db->prepare("SELECT * FROM liquidaciones WHERE liquidacion_id = :id");
        $stmt->execute(['id' => $liquidacionId]);
        $row = $stmt->fetch();
        return $row ? $this->mapRowToEntity($row) : null;
    }

    public function listarPorAnfitrion(string $anfitrionId): array
    {
        $stmt = $this->db->prepare("SELECT * FROM liquidaciones WHERE anfitrion_id = :anfitrion ORDER BY created_at DESC");
        $stmt->execute(['anfitrion' => $anfitrionId]);
        $rows = $stmt->fetchAll();
        return array_map([$this, 'mapRowToEntity'], $rows);
    }

    private function mapRowToEntity(array $row): Liquidacion
    {
        return new Liquidacion(
            liquidacionId: $row['liquidacion_id'],
            anfitrionId: $row['anfitrion_id'],
            metodoId: $row['metodo_id'],
            periodoDesde: new DateTimeImmutable($row['periodo_desde']),
            periodoHasta: new DateTimeImmutable($row['periodo_hasta']),
            totalBruto: (float) $row['total_bruto'],
            totalComisiones: (float) $row['total_comisiones'],
            estado: EstadoLiquidacion::from($row['estado']),
            createdAt: new DateTimeImmutable($row['created_at'])
        );
    }
}
