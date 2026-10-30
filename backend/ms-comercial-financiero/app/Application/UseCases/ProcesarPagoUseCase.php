<?php

namespace App\Application\UseCases;

use App\Application\DTOs\ProcesarPagoDTO;
use App\Application\DTOs\PagoResponseDTO;
use App\Domain\Entities\Pago;
use App\Domain\Entities\OutboxEvento;
use App\Domain\Enums\EstadoPago;
use App\Domain\Repositories\PagoRepositoryInterface;
use App\Domain\Repositories\PromocionRepositoryInterface;
use App\Domain\Repositories\ReglaMonetizacionRepositoryInterface;
use App\Domain\Repositories\OutboxRepositoryInterface;
use Ramsey\Uuid\Uuid;

class ProcesarPagoUseCase
{
    public function __construct(
        private readonly PagoRepositoryInterface $pagoRepository,
        private readonly PromocionRepositoryInterface $promocionRepository,
        private readonly ReglaMonetizacionRepositoryInterface $reglaRepository,
        private readonly OutboxRepositoryInterface $outboxRepository
    ) {}

    public function ejecutar(ProcesarPagoDTO $dto): array
    {
        $idempotencyKey = $dto->idempotencyKey ?? Uuid::uuid4()->toString();

        // 1. Verificar idempotencia
        $pagoExistente = $this->pagoRepository->buscarPorIdempotencyKey($idempotencyKey);
        if ($pagoExistente !== null) {
            return PagoResponseDTO::fromEntity($pagoExistente);
        }

        // 2. Verificar si ya existe pago para esta reserva
        $pagoPorReserva = $this->pagoRepository->buscarPorReservaId($dto->reservaId);
        if ($pagoPorReserva !== null && $pagoPorReserva->getEstado() === EstadoPago::COMPLETADO) {
            return PagoResponseDTO::fromEntity($pagoPorReserva);
        }

        // 3. Aplicar promoción si corresponde
        $descuento = 0.0;
        $promocionId = null;
        if (!empty($dto->codigoPromocion)) {
            $promocion = $this->promocionRepository->buscarPorCodigo($dto->codigoPromocion);
            if ($promocion !== null) {
                $descuento = $promocion->calcularDescuento($dto->subtotal);
                $promocionId = $promocion->getPromocionId();
            }
        }

        // 4. Calcular cargo de servicio para el huésped (ej. 5% tasa de servicio plataforma Aloja-Te)
        $subtotalConDescuento = max(0.0, $dto->subtotal - $descuento);
        $reglaServicio = $this->reglaRepository->buscarVigentePorCategoria('CARGO_SERVICIO');
        $cargoServicio = $reglaServicio ? $reglaServicio->calcularMonto($subtotalConDescuento) : round($subtotalConDescuento * 0.05, 2);

        $pagoId = Uuid::uuid4()->toString();
        $sagaId = $dto->sagaId ?? Uuid::uuid4()->toString();

        // 5. Instanciar Entidad de Dominio Pago
        $pago = new Pago(
            pagoId: $pagoId,
            reservaId: $dto->reservaId,
            anfitrionId: $dto->anfitrionId,
            subtotalAlojamiento: $dto->subtotal,
            cargoServicio: $cargoServicio,
            idempotencyKey: $idempotencyKey,
            sagaId: $sagaId,
            promocionId: $promocionId,
            descuento: $descuento,
            estado: EstadoPago::PENDIENTE
        );

        $this->pagoRepository->guardar($pago);

        // 6. Generar Outbox Event para auditoría / AMQP
        $outbox = new OutboxEvento(
            eventoId: Uuid::uuid4()->toString(),
            tipoEvento: 'pago.iniciado',
            payload: [
                'pagoId' => $pagoId,
                'reservaId' => $dto->reservaId,
                'anfitrionId' => $dto->anfitrionId,
                'montoTotal' => $pago->getMontoTotal(),
                'sagaId' => $sagaId,
                'timestamp' => (new \DateTimeImmutable())->format('c')
            ]
        );
        $this->outboxRepository->guardar($outbox);

        // 7. Simulación de datos para QR Simple BNB en Bolivia
        $qrSimpleData = [
            'alias' => 'ALOJATE-BOLIVIA',
            'banco' => 'Banco Nacional de Bolivia (BNB)',
            'moneda' => 'BOB',
            'monto' => $pago->getMontoTotal(),
            'glosa' => "Reserva Aloja-Te #{$dto->reservaId}",
            'qrRawString' => "00020101021253030685404{$pago->getMontoTotal()}5802BO5915ALOJATE BOLIVIA6010SANTA CRUZ62070503BNB6304ABCD",
            'expiraEnSegundos' => 900 // 15 minutos de TTL
        ];

        return PagoResponseDTO::fromEntity($pago, $qrSimpleData);
    }
}
