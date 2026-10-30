<?php

namespace App\Domain\Entities;

use App\Domain\Enums\EstadoLiquidacion;
use DateTimeImmutable;

class Liquidacion
{
    private string $liquidacionId;
    private string $anfitrionId;
    private string $metodoId;
    private DateTimeImmutable $periodoDesde;
    private DateTimeImmutable $periodoHasta;
    private float $totalBruto;
    private float $totalComisiones;
    private float $totalNeto;
    private EstadoLiquidacion $estado;
    private DateTimeImmutable $createdAt;

    public function __construct(
        string $liquidacionId,
        string $anfitrionId,
        string $metodoId,
        DateTimeImmutable $periodoDesde,
        DateTimeImmutable $periodoHasta,
        float $totalBruto,
        float $totalComisiones,
        EstadoLiquidacion $estado = EstadoLiquidacion::PENDIENTE,
        ?DateTimeImmutable $createdAt = null
    ) {
        $this->liquidacionId = $liquidacionId;
        $this->anfitrionId = $anfitrionId;
        $this->metodoId = $metodoId;
        $this->periodoDesde = $periodoDesde;
        $this->periodoHasta = $periodoHasta;
        $this->totalBruto = $totalBruto;
        $this->totalComisiones = $totalComisiones;
        $this->totalNeto = round($totalBruto - $totalComisiones, 2);
        $this->estado = $estado;
        $this->createdAt = $createdAt ?? new DateTimeImmutable();
    }

    public function marcarPagada(): void
    {
        $this->estado = EstadoLiquidacion::PAGADA;
    }

    public function getLiquidacionId(): string { return $this->liquidacionId; }
    public function getAnfitrionId(): string { return $this->anfitrionId; }
    public function getMetodoId(): string { return $this->metodoId; }
    public function getPeriodoDesde(): DateTimeImmutable { return $this->periodoDesde; }
    public function getPeriodoHasta(): DateTimeImmutable { return $this->periodoHasta; }
    public function getTotalBruto(): float { return $this->totalBruto; }
    public function getTotalComisiones(): float { return $this->totalComisiones; }
    public function getTotalNeto(): float { return $this->totalNeto; }
    public function getEstado(): EstadoLiquidacion { return $this->estado; }
    public function getCreatedAt(): DateTimeImmutable { return $this->createdAt; }
}
