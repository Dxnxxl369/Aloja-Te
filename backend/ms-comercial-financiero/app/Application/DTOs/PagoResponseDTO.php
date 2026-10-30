<?php

namespace App\Application\DTOs;

use App\Domain\Entities\Pago;

class PagoResponseDTO
{
    public static function fromEntity(Pago $pago, ?array $qrPayload = null): array
    {
        return [
            'pagoId' => $pago->getPagoId(),
            'reservaId' => $pago->getReservaId(),
            'anfitrionId' => $pago->getAnfitrionId(),
            'promocionId' => $pago->getPromocionId(),
            'subtotalAlojamiento' => $pago->getSubtotalAlojamiento(),
            'descuento' => $pago->getDescuento(),
            'cargoServicio' => $pago->getCargoServicio(),
            'montoTotal' => $pago->getMontoTotal(),
            'moneda' => 'BOB',
            'estado' => $pago->getEstado()->value,
            'idempotencyKey' => $pago->getIdempotencyKey(),
            'sagaId' => $pago->getSagaId(),
            'qrSimpleData' => $qrPayload,
            'comprobantes' => array_map(fn($c) => [
                'comprobanteId' => $c->getComprobanteId(),
                'tipo' => $c->getTipo()->value,
                'numero' => $c->getNumero(),
                'fechaEmision' => $c->getCreatedAt()->format('c')
            ], $pago->getComprobantes()),
            'fechaCreacion' => $pago->getCreatedAt()?->format('c')
        ];
    }
}
