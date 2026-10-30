<?php

namespace App\Domain\Entities;

use App\Domain\Enums\EstadoPago;
use App\Domain\Enums\TipoTransaccion;
use App\Domain\Enums\TipoComprobante;
use DateTimeImmutable;

class Pago
{
    private string $pagoId;
    private string $reservaId;
    private string $anfitrionId;
    private ?string $promocionId;
    private float $subtotalAlojamiento;
    private float $descuento;
    private float $cargoServicio;
    private float $montoTotal;
    private EstadoPago $estado;
    private string $idempotencyKey;
    private string $sagaId;
    private ?DateTimeImmutable $createdAt;
    private ?DateTimeImmutable $updatedAt;

    /** @var TransaccionPago[] */
    private array $transacciones = [];

    /** @var Comprobante[] */
    private array $comprobantes = [];

    /** @var Reembolso[] */
    private array $reembolsos = [];

    private ?Comision $comision = null;

    public function __construct(
        string $pagoId,
        string $reservaId,
        string $anfitrionId,
        float $subtotalAlojamiento,
        float $cargoServicio,
        string $idempotencyKey,
        string $sagaId,
        ?string $promocionId = null,
        float $descuento = 0.0,
        EstadoPago $estado = EstadoPago::PENDIENTE,
        ?DateTimeImmutable $createdAt = null,
        ?DateTimeImmutable $updatedAt = null
    ) {
        $this->pagoId = $pagoId;
        $this->reservaId = $reservaId;
        $this->anfitrionId = $anfitrionId;
        $this->subtotalAlojamiento = $subtotalAlojamiento;
        $this->cargoServicio = $cargoServicio;
        $this->idempotencyKey = $idempotencyKey;
        $this->sagaId = $sagaId;
        $this->promocionId = $promocionId;
        $this->descuento = $descuento;
        $this->montoTotal = round(($subtotalAlojamiento - $descuento) + $cargoServicio, 2);
        $this->estado = $estado;
        $this->createdAt = $createdAt ?? new DateTimeImmutable();
        $this->updatedAt = $updatedAt ?? new DateTimeImmutable();
    }

    public function confirmarPago(string $transaccionId, TipoTransaccion $tipo, string $referenciaPasarela): TransaccionPago
    {
        if ($this->estado === EstadoPago::COMPLETADO) {
            throw new \DomainException("El pago {$this->pagoId} ya se encuentra completado.");
        }

        $transaccion = new TransaccionPago(
            transaccionId: $transaccionId,
            pagoId: $this->pagoId,
            tipo: $tipo,
            monto: $this->montoTotal,
            referenciaPasarela: $referenciaPasarela
        );

        $this->transacciones[] = $transaccion;
        $this->estado = EstadoPago::COMPLETADO;
        $this->updatedAt = new DateTimeImmutable();

        return $transaccion;
    }

    public function emitirComprobante(string $comprobanteId, TipoComprobante $tipo, string $numero): Comprobante
    {
        $comprobante = new Comprobante(
            comprobanteId: $comprobanteId,
            pagoId: $this->pagoId,
            tipo: $tipo,
            numero: $numero
        );

        $this->comprobantes[] = $comprobante;
        return $comprobante;
    }

    public function solicitarReembolso(string $reembolsoId, float $monto, string $motivo): Reembolso
    {
        if ($this->estado !== EstadoPago::COMPLETADO) {
            throw new \DomainException("Solo se pueden reembolsar pagos en estado COMPLETADO.");
        }

        if ($monto > $this->montoTotal) {
            throw new \DomainException("El monto a reembolsar (BOB {$monto}) supera el monto total del pago (BOB {$this->montoTotal}).");
        }

        $reembolso = new Reembolso(
            reembolsoId: $reembolsoId,
            pagoId: $this->pagoId,
            monto: $monto,
            motivo: $motivo
        );

        $this->reembolsos[] = $reembolso;
        $this->estado = EstadoPago::REEMBOLSADO;
        $this->updatedAt = new DateTimeImmutable();

        return $reembolso;
    }

    public function asignarComision(Comision $comision): void
    {
        $this->comision = $comision;
    }

    // Getters
    public function getPagoId(): string { return $this->pagoId; }
    public function getReservaId(): string { return $this->reservaId; }
    public function getAnfitrionId(): string { return $this->anfitrionId; }
    public function getPromocionId(): ?string { return $this->promocionId; }
    public function getSubtotalAlojamiento(): float { return $this->subtotalAlojamiento; }
    public function getDescuento(): float { return $this->descuento; }
    public function getCargoServicio(): float { return $this->cargoServicio; }
    public function getMontoTotal(): float { return $this->montoTotal; }
    public function getEstado(): EstadoPago { return $this->estado; }
    public function getIdempotencyKey(): string { return $this->idempotencyKey; }
    public function getSagaId(): string { return $this->sagaId; }
    public function getCreatedAt(): ?DateTimeImmutable { return $this->createdAt; }
    public function getUpdatedAt(): ?DateTimeImmutable { return $this->updatedAt; }
    public function getTransacciones(): array { return $this->transacciones; }
    public function getComprobantes(): array { return $this->comprobantes; }
    public function getReembolsos(): array { return $this->reembolsos; }
    public function getComision(): ?Comision { return $this->comision; }
}
