<?php

namespace App\Domain\Exceptions;

/**
 * Se lanza cuando NO se debe crear el cobro (reserva inexistente, vencida, ya pagada, monto distinto…).
 * Lleva el estado HTTP y un código de negocio para que el cliente (app móvil, portal) sepa qué pasó.
 */
class PagoRechazadoException extends \DomainException
{
    public function __construct(
        string $mensaje,
        private readonly int $estadoHttp,
        private readonly string $codigo
    ) {
        parent::__construct($mensaje);
    }

    public function getEstadoHttp(): int
    {
        return $this->estadoHttp;
    }

    public function getCodigo(): string
    {
        return $this->codigo;
    }
}
