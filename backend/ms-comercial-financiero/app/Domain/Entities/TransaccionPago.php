<?php

namespace App\Domain\Entities;

use App\Domain\Enums\TipoTransaccion;
use DateTimeImmutable;

class TransaccionPago
{
    private string $transaccionId;
    private string $pagoId;
    private TipoTransaccion $tipo;
    private float $monto;
    private string $referenciaPasarela;
    private DateTimeImmutable $createdAt;

    public function __construct(
        string $transaccionId,
        string $pagoId,
        TipoTransaccion $tipo,
        float $monto,
        string $referenciaPasarela,
        ?DateTimeImmutable $createdAt = null
    ) {
        $this->transaccionId = $transaccionId;
        $this->pagoId = $pagoId;
        $this->tipo = $tipo;
        $this->monto = $monto;
        $this->referenciaPasarela = $referenciaPasarela;
        $this->createdAt = $createdAt ?? new DateTimeImmutable();
    }

    public function getTransaccionId(): string { return $this->transaccionId; }
    public function getPagoId(): string { return $this->pagoId; }
    public function getTipo(): TipoTransaccion { return $this->tipo; }
    public function getMonto(): float { return $this->monto; }
    public function getReferenciaPasarela(): string { return $this->referenciaPasarela; }
    public function getCreatedAt(): DateTimeImmutable { return $this->createdAt; }
}
