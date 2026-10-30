<?php

namespace App\Domain\Entities;

use App\Domain\Enums\TipoMovimientoContable;
use DateTimeImmutable;

class MovimientoContable
{
    private ?int $movimientoId;
    private string $asientoId;
    private string $cuenta;
    private TipoMovimientoContable $tipo;
    private float $monto;
    private string $origenTipo;
    private string $origenId;
    private DateTimeImmutable $createdAt;

    public function __construct(
        string $asientoId,
        string $cuenta,
        TipoMovimientoContable $tipo,
        float $monto,
        string $origenTipo,
        string $origenId,
        ?int $movimientoId = null,
        ?DateTimeImmutable $createdAt = null
    ) {
        $this->movimientoId = $movimientoId;
        $this->asientoId = $asientoId;
        $this->cuenta = $cuenta;
        $this->tipo = $tipo;
        $this->monto = $monto;
        $this->origenTipo = $origenTipo;
        $this->origenId = $origenId;
        $this->createdAt = $createdAt ?? new DateTimeImmutable();
    }

    public function getMovimientoId(): ?int { return $this->movimientoId; }
    public function getAsientoId(): string { return $this->asientoId; }
    public function getCuenta(): string { return $this->cuenta; }
    public function getTipo(): TipoMovimientoContable { return $this->tipo; }
    public function getMonto(): float { return $this->monto; }
    public function getOrigenTipo(): string { return $this->origenTipo; }
    public function getOrigenId(): string { return $this->origenId; }
    public function getCreatedAt(): DateTimeImmutable { return $this->createdAt; }
}
