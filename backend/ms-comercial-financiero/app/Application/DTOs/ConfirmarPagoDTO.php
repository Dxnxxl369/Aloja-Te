<?php

namespace App\Application\DTOs;

class ConfirmarPagoDTO
{
    public function __construct(
        public readonly string $pagoId,
        public readonly string $transaccionBancariaRef,
        public readonly string $metodoPago = 'QR_SIMPLE_BNB'
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            pagoId: $data['pagoId'],
            transaccionBancariaRef: $data['transaccionBancariaRef'] ?? ('BNB-TX-' . rand(10000000, 99999999)),
            metodoPago: $data['metodoPago'] ?? 'QR_SIMPLE_BNB'
        );
    }
}
