<?php

namespace App\Domain\Entities;

use DateTimeImmutable;

class Comision
{
    private string $comisionId;
    private string $pagoId;
    private string $reglaId;
    private ?string $liquidacionId;
    private float $baseComisionable;
    private float $porcentajeAplicado;
    private float $montoComision;
    private float $montoNetoAnfitrion;
    private string $estado;
    private DateTimeImmutable $createdAt;

    public function __construct(
        string $comisionId,
        string $pagoId,
        string $reglaId,
        float $baseComisionable,
        float $porcentajeAplicado,
        ?string $liquidacionId = null,
        string $estado = 'PENDIENTE',
        ?DateTimeImmutable $createdAt = null
    ) {
        $this->comisionId = $comisionId;
        $this->pagoId = $pagoId;
        $this->reglaId = $reglaId;
        $this->baseComisionable = $baseComisionable;
        $this->porcentajeAplicado = $porcentajeAplicado;
        $this->montoComision = round($baseComisionable * ($porcentajeAplicado / 100.0), 2);
        $this->montoNetoAnfitrion = round($baseComisionable - $this->montoComision, 2);
        $this->liquidacionId = $liquidacionId;
        $this->estado = $estado;
        $this->createdAt = $createdAt ?? new DateTimeImmutable();
    }

    public function asociarLiquidacion(string $liquidacionId): void
    {
        $this->liquidacionId = $liquidacionId;
        $this->estado = 'LIQUIDADA';
    }

    public function getComisionId(): string { return $this->comisionId; }
    public function getPagoId(): string { return $this->pagoId; }
    public function getReglaId(): string { return $this->reglaId; }
    public function getLiquidacionId(): ?string { return $this->liquidacionId; }
    public function getBaseComisionable(): float { return $this->baseComisionable; }
    public function getPorcentajeAplicado(): float { return $this->porcentajeAplicado; }
    public function getMontoComision(): float { return $this->montoComision; }
    public function getMontoNetoAnfitrion(): float { return $this->montoNetoAnfitrion; }
    public function getEstado(): string { return $this->estado; }
    public function getCreatedAt(): DateTimeImmutable { return $this->createdAt; }
}
