<?php

namespace App\Application\UseCases;

use App\Domain\Entities\MovimientoContable;
use App\Domain\Entities\OutboxEvento;
use App\Domain\Enums\TipoMovimientoContable;
use App\Domain\Repositories\PagoRepositoryInterface;
use App\Domain\Repositories\MovimientoContableRepositoryInterface;
use App\Domain\Repositories\OutboxRepositoryInterface;
use Ramsey\Uuid\Uuid;

class ProcesarReembolsoSagaUseCase
{
    public function __construct(
        private readonly PagoRepositoryInterface $pagoRepository,
        private readonly MovimientoContableRepositoryInterface $contabilidadRepository,
        private readonly OutboxRepositoryInterface $outboxRepository
    ) {}

    public function ejecutar(string $reservaId, ?float $montoReembolso = null, string $motivo = 'Cancelación de reserva SAGA'): array
    {
        $pago = $this->pagoRepository->buscarPorReservaId($reservaId);
        if ($pago === null) {
            throw new \InvalidArgumentException("No se encontró pago para la reserva {$reservaId}");
        }

        $montoEfectivo = $montoReembolso ?? $pago->getMontoTotal();
        $reembolsoId = Uuid::uuid4()->toString();
        $reembolso = $pago->solicitarReembolso($reembolsoId, $montoEfectivo, $motivo);
        $reembolso->procesar();

        $this->pagoRepository->guardar($pago);

        // Reversión contable
        $asientoId = Uuid::uuid4()->toString();
        // DEBE: Devoluciones en ventas / Cuentas de pasivo
        $this->contabilidadRepository->guardar(new MovimientoContable(
            asientoId: $asientoId,
            cuenta: '4.1.9.01 - Devoluciones y Reembolsos a Clientes',
            tipo: TipoMovimientoContable::DEBITO,
            monto: $montoEfectivo,
            origenTipo: 'REEMBOLSO',
            origenId: $reembolsoId
        ));

        // HABER: Salida de banco al cliente
        $this->contabilidadRepository->guardar(new MovimientoContable(
            asientoId: $asientoId,
            cuenta: '1.1.1.01 - Banco BNB Cuenta Fiscal',
            tipo: TipoMovimientoContable::CREDITO,
            monto: $montoEfectivo,
            origenTipo: 'REEMBOLSO',
            origenId: $reembolsoId
        ));

        // Evento Outbox SAGA
        $outbox = new OutboxEvento(
            eventoId: Uuid::uuid4()->toString(),
            tipoEvento: 'pago.reembolsado',
            payload: [
                'reembolsoId' => $reembolsoId,
                'pagoId' => $pago->getPagoId(),
                'reservaId' => $reservaId,
                'montoReembolsado' => $montoEfectivo,
                'motivo' => $motivo,
                'sagaId' => $pago->getSagaId(),
                'timestamp' => (new \DateTimeImmutable())->format('c')
            ]
        );
        $this->outboxRepository->guardar($outbox);

        return [
            'reembolsoId' => $reembolsoId,
            'pagoId' => $pago->getPagoId(),
            'reservaId' => $reservaId,
            'montoReembolsado' => $montoEfectivo,
            'estado' => $pago->getEstado()->value,
            'asientoContableId' => $asientoId,
            'sagaStatus' => 'REEMBOLSO_COMPENSADO'
        ];
    }
}
