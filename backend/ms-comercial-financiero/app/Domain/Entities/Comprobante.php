<?php

namespace App\Domain\Entities;

use App\Domain\Enums\TipoComprobante;
use DateTimeImmutable;

class Comprobante
{
    private string $comprobanteId;
    private string $pagoId;
    private TipoComprobante $tipo;
    private string $numero;
    private DateTimeImmutable $createdAt;

    public function __construct(
        string $comprobanteId,
        string $pagoId,
        TipoComprobante $tipo,
        string $numero,
        ?DateTimeImmutable $createdAt = null
    ) {
        $this->comprobanteId = $comprobanteId;
        $this->pagoId = $pagoId;
        $this->tipo = $tipo;
        $this->numero = $numero;
        $this->createdAt = $createdAt ?? new DateTimeImmutable();
    }

    public function getComprobanteId(): string { return $this->comprobanteId; }
    public function getPagoId(): string { return $this->pagoId; }
    public function getTipo(): TipoComprobante { return $this->tipo; }
    public function getNumero(): string { return $this->numero; }
    public function getCreatedAt(): DateTimeImmutable { return $this->createdAt; }
}
