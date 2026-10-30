<?php

namespace App\Infrastructure\Persistence\Repositories;

use App\Domain\Entities\ReglaMonetizacion;
use App\Domain\Enums\ConceptoMonetizacion;
use App\Domain\Enums\TipoCalculo;
use App\Domain\Repositories\ReglaMonetizacionRepositoryInterface;
use App\Infrastructure\Persistence\PdoDatabase;
use PDO;
use DateTimeImmutable;

class PdoReglaMonetizacionRepository implements ReglaMonetizacionRepositoryInterface
{
    private PDO $db;

    public function __construct()
    {
        $this->db = PdoDatabase::getInstance();
    }

    public function guardar(ReglaMonetizacion $regla): void
    {
        $stmt = $this->db->prepare("INSERT OR REPLACE INTO reglas_monetizacion 
            (regla_id, concepto, tipo_calculo, porcentaje, categoria_alojamiento, vigente_desde, vigente_hasta)
            VALUES (:id, :concepto, :tipo, :porc, :cat, :desde, :hasta)");
        
        $stmt->execute([
            'id' => $regla->getReglaId(),
            'concepto' => $regla->getConcepto()->value,
            'tipo' => $regla->getTipoCalculo()->value,
            'porc' => $regla->getPorcentaje(),
            'cat' => $regla->getCategoriaAlojamiento(),
            'desde' => $regla->getVigenteDesde()?->format('Y-m-d H:i:s'),
            'hasta' => $regla->getVigenteHasta()?->format('Y-m-d H:i:s')
        ]);
    }

    public function buscarPorId(string $reglaId): ?ReglaMonetizacion
    {
        $stmt = $this->db->prepare("SELECT * FROM reglas_monetizacion WHERE regla_id = :id");
        $stmt->execute(['id' => $reglaId]);
        $row = $stmt->fetch();
        return $row ? $this->mapRowToEntity($row) : null;
    }

    public function buscarVigentePorCategoria(string $concepto, ?string $categoria = null): ?ReglaMonetizacion
    {
        $stmt = $this->db->prepare("SELECT * FROM reglas_monetizacion 
            WHERE concepto = :concepto 
            AND (vigente_hasta IS NULL OR vigente_hasta >= CURRENT_TIMESTAMP)
            ORDER BY vigente_desde DESC LIMIT 1");
        $stmt->execute(['concepto' => $concepto]);
        $row = $stmt->fetch();
        return $row ? $this->mapRowToEntity($row) : null;
    }

    public function listarTodas(): array
    {
        $stmt = $this->db->query("SELECT * FROM reglas_monetizacion ORDER BY concepto, porcentaje DESC");
        $rows = $stmt->fetchAll();
        return array_map([$this, 'mapRowToEntity'], $rows);
    }

    private function mapRowToEntity(array $row): ReglaMonetizacion
    {
        return new ReglaMonetizacion(
            reglaId: $row['regla_id'],
            concepto: ConceptoMonetizacion::from($row['concepto']),
            tipoCalculo: TipoCalculo::from($row['tipo_calculo']),
            porcentaje: (float) $row['porcentaje'],
            categoriaAlojamiento: $row['categoria_alojamiento'],
            vigenteDesde: $row['vigente_desde'] ? new DateTimeImmutable($row['vigente_desde']) : null,
            vigenteHasta: $row['vigente_hasta'] ? new DateTimeImmutable($row['vigente_hasta']) : null
        );
    }
}
