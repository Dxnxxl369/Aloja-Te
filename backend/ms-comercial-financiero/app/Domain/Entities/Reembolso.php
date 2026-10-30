<?php

namespace App\Domain\Entities;

use App\Domain\Enums\EstadoReembolso;
use DateTimeImmutable;

class Reembolso
{
    private string $reembolsoId;
    private string $pagoId;
    private float $monto;
    private string $motivo;
    private EstadoReembolso $estado;
    private DateTimeImmutable $createdAt;

    public function __construct(
        string $reembolsoId,
        string $pagoId,
        float $monto,
        string $motivo,
        EstadoReembolso $estado = EstadoReembolso::PENDIENTE,
        ?DateTimeImmutable $createdAt = null
    ) {
        $this->reembolsoId = $reembolsoId;
        $this->pagoId = $pagoId;
        $this->monto = $monto;
        $this->motivo = $motivo;
        $this->estado = $estado;
        $this->createdAt = $createdAt ?? new DateTimeImmutable();
    }

    public function procesar(): void
    {
        $this->estado = EstadoReembolso::PROCESADO;
    }

    public function rechazar(): void
    {
        $this->estado = EstadoReembolso::RECHAZADO;
    }

    public function getReembolsoId(): string { return $this->reembolsoId; }
    public function getPagoId(): string { return $this->pagoId; }
    public function getMonto(): float { return $this->monto; }
    public function getMotivo(): string { return $this->motivo; }
    public function getEstado(): EstadoReembolso { return $this->estado; }
    public function getCreatedAt(): DateTimeImmutable { return $this->createdAt; }
}
