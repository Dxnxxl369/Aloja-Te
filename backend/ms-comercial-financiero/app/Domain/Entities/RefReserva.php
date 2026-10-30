<?php

namespace App\Domain\Entities;

use DateTimeImmutable;

class RefReserva
{
    private string $reservaId;
    private string $clienteId;
    private string $alojamientoId;
    private DateTimeImmutable $fechaCheckin;
    private DateTimeImmutable $fechaCheckout;
    private string $estado;

    public function __construct(
        string $reservaId,
        string $clienteId,
        string $alojamientoId,
        DateTimeImmutable $fechaCheckin,
        DateTimeImmutable $fechaCheckout,
        string $estado = 'PENDIENTE_PAGO'
    ) {
        $this->reservaId = $reservaId;
        $this->clienteId = $clienteId;
        $this->alojamientoId = $alojamientoId;
        $this->fechaCheckin = $fechaCheckin;
        $this->fechaCheckout = $fechaCheckout;
        $this->estado = $estado;
    }

    public function getReservaId(): string { return $this->reservaId; }
    public function getClienteId(): string { return $this->clienteId; }
    public function getAlojamientoId(): string { return $this->alojamientoId; }
    public function getFechaCheckin(): DateTimeImmutable { return $this->fechaCheckin; }
    public function getFechaCheckout(): DateTimeImmutable { return $this->fechaCheckout; }
    public function getEstado(): string { return $this->estado; }
}
