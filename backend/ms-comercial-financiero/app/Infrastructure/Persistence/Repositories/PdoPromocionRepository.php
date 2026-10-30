<?php

namespace App\Infrastructure\Persistence\Repositories;

use App\Domain\Entities\Promocion;
use App\Domain\Enums\TipoCalculo;
use App\Domain\Repositories\PromocionRepositoryInterface;
use App\Infrastructure\Persistence\PdoDatabase;
use PDO;
use DateTimeImmutable;

class PdoPromocionRepository implements PromocionRepositoryInterface
{
    private PDO $db;

    public function __construct()
    {
        $this->db = PdoDatabase::getInstance();
    }

    public function guardar(Promocion $promocion): void
    {
        $stmt = $this->db->prepare("INSERT OR REPLACE INTO promociones 
            (promocion_id, codigo, tipo, tipo_descuento, valor, vigente_desde, vigente_hasta, estado)
            VALUES (:id, :codigo, :tipo, :tipo_desc, :valor, :desde, :hasta, :estado)");
        
        $stmt->execute([
            'id' => $promocion->getPromocionId(),
            'codigo' => $promocion->getCodigo(),
            'tipo' => $promocion->getTipo(),
            'tipo_desc' => $promocion->getTipoDescuento()->value,
            'valor' => $promocion->getValor(),
            'desde' => $promocion->getVigenteDesde()->format('Y-m-d H:i:s'),
            'hasta' => $promocion->getVigenteHasta()->format('Y-m-d H:i:s'),
            'estado' => $promocion->getEstado()
        ]);
    }

    public function buscarPorCodigo(string $codigo): ?Promocion
    {
        $stmt = $this->db->prepare("SELECT * FROM promociones WHERE UPPER(codigo) = UPPER(:codigo) LIMIT 1");
        $stmt->execute(['codigo' => trim($codigo)]);
        $row = $stmt->fetch();
        return $row ? $this->mapRowToEntity($row) : null;
    }

    public function buscarPorId(string $promocionId): ?Promocion
    {
        $stmt = $this->db->prepare("SELECT * FROM promociones WHERE promocion_id = :id");
        $stmt->execute(['id' => $promocionId]);
        $row = $stmt->fetch();
        return $row ? $this->mapRowToEntity($row) : null;
    }

    private function mapRowToEntity(array $row): Promocion
    {
        return new Promocion(
            promocionId: $row['promocion_id'],
            codigo: $row['codigo'],
            tipo: $row['tipo'],
            tipoDescuento: TipoCalculo::from($row['tipo_descuento']),
            valor: (float) $row['valor'],
            vigenteDesde: new DateTimeImmutable($row['vigente_desde']),
            vigenteHasta: new DateTimeImmutable($row['vigente_hasta']),
            estado: $row['estado']
        );
    }
}
