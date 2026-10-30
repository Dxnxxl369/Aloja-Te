<?php

namespace App\Application\DTOs;

class ProcesarPagoDTO
{
    public function __construct(
        public readonly string $reservaId,
        public readonly string $anfitrionId,
        public readonly float $subtotal,
        public readonly string $metodoPago = 'QR_SIMPLE_BNB',
        public readonly ?string $codigoPromocion = null,
        public readonly ?string $idempotencyKey = null,
        public readonly ?string $sagaId = null
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            reservaId: $data['reservaId'],
            anfitrionId: $data['anfitrionId'],
            subtotal: (float) $data['subtotal'],
            metodoPago: $data['metodoPago'] ?? 'QR_SIMPLE_BNB',
            codigoPromocion: $data['codigoPromocion'] ?? null,
            idempotencyKey: $data['idempotencyKey'] ?? null,
            sagaId: $data['sagaId'] ?? null
        );
    }
}
