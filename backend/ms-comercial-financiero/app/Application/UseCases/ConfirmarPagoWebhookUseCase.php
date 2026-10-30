<?php

namespace App\Application\UseCases;

use App\Application\DTOs\ConfirmarPagoDTO;
use App\Application\DTOs\PagoResponseDTO;
use App\Domain\Entities\Comision;
use App\Domain\Entities\MovimientoContable;
use App\Domain\Entities\OutboxEvento;
use App\Domain\Enums\TipoTransaccion;
use App\Domain\Enums\TipoComprobante;
use App\Domain\Enums\TipoMovimientoContable;
use App\Domain\Repositories\PagoRepositoryInterface;
use App\Domain\Repositories\ComisionRepositoryInterface;
use App\Domain\Repositories\ReglaMonetizacionRepositoryInterface;
use App\Domain\Repositories\MovimientoContableRepositoryInterface;
use App\Domain\Repositories\OutboxRepositoryInterface;
use Ramsey\Uuid\Uuid;

class ConfirmarPagoWebhookUseCase
{
    public function __construct(
        private readonly PagoRepositoryInterface $pagoRepository,
        private readonly ComisionRepositoryInterface $comisionRepository,
        private readonly ReglaMonetizacionRepositoryInterface $reglaRepository,
        private readonly MovimientoContableRepositoryInterface $contabilidadRepository,
        private readonly OutboxRepositoryInterface $outboxRepository
    ) {}

    public function ejecutar(ConfirmarPagoDTO $dto): array
    {
        $pago = $this->pagoRepository->buscarPorId($dto->pagoId);
        if ($pago === null) {
            // Intentar por reservaId
            $pago = $this->pagoRepository->buscarPorReservaId($dto->pagoId);
        }

        if ($pago === null) {
            throw new \InvalidArgumentException("No se encontró el registro de pago para: {$dto->pagoId}");
        }

        // 1. Registrar Transacción de Pago
        $transaccionId = Uuid::uuid4()->toString();
        $tipoTransaccion = TipoTransaccion::tryFrom($dto->metodoPago) ?? TipoTransaccion::QR_SIMPLE_BNB;
        $pago->confirmarPago($transaccionId, $tipoTransaccion, $dto->transaccionBancariaRef);

        // 2. Emitir Comprobante / Factura Oficial (SIN Bolivia)
        $numeroFactura = 'FAC-' . date('Ymd') . '-' . strtoupper(substr(md5($pago->getPagoId()), 0, 6));
        $pago->emitirComprobante(
            comprobanteId: Uuid::uuid4()->toString(),
            tipo: TipoComprobante::FACTURA,
            numero: $numeroFactura
        );

        // 3. Calcular Comisión de Anfitrión (Regla: ej. 10% comisión sobre el subtotal)
        $reglaComision = $this->reglaRepository->buscarVigentePorCategoria('COMISION');
        $porcentajeComision = $reglaComision ? $reglaComision->getPorcentaje() : 10.0;
        $baseComisionable = $pago->getSubtotalAlojamiento() - $pago->getDescuento();

        $comision = new Comision(
            comisionId: Uuid::uuid4()->toString(),
            pagoId: $pago->getPagoId(),
            reglaId: $reglaComision ? $reglaComision->getReglaId() : Uuid::uuid4()->toString(),
            baseComisionable: $baseComisionable,
            porcentajeAplicado: $porcentajeComision
        );
        $this->comisionRepository->guardar($comision);
        $pago->asignarComision($comision);

        // 4. Registro Contable en Partida Doble
        $asientoId = Uuid::uuid4()->toString();
        
        // DEBE: Banco BNB Cuenta Fiscal (Entrada total de dinero)
        $this->contabilidadRepository->guardar(new MovimientoContable(
            asientoId: $asientoId,
            cuenta: '1.1.1.01 - Banco BNB Cuenta Fiscal',
            tipo: TipoMovimientoContable::DEBITO,
            monto: $pago->getMontoTotal(),
            origenTipo: 'PAGO',
            origenId: $pago->getPagoId()
        ));

        // HABER: Cuentas por Pagar a Anfitriones (Pasivo neto)
        $this->contabilidadRepository->guardar(new MovimientoContable(
            asientoId: $asientoId,
            cuenta: '2.1.2.01 - Cuentas por Pagar a Anfitriones',
            tipo: TipoMovimientoContable::CREDITO,
            monto: $comision->getMontoNetoAnfitrion(),
            origenTipo: 'PAGO',
            origenId: $pago->getPagoId()
        ));

        // HABER: Ingresos por Comisiones (Ganancia plataforma)
        $this->contabilidadRepository->guardar(new MovimientoContable(
            asientoId: $asientoId,
            cuenta: '4.1.1.01 - Ingresos por Comisiones de Plataforma',
            tipo: TipoMovimientoContable::CREDITO,
            monto: $comision->getMontoComision(),
            origenTipo: 'PAGO',
            origenId: $pago->getPagoId()
        ));

        // HABER: Ingresos por Cargo por Servicio (Ganancia plataforma)
        if ($pago->getCargoServicio() > 0) {
            $this->contabilidadRepository->guardar(new MovimientoContable(
                asientoId: $asientoId,
                cuenta: '4.1.1.02 - Ingresos por Cargo de Servicio',
                tipo: TipoMovimientoContable::CREDITO,
                monto: $pago->getCargoServicio(),
                origenTipo: 'PAGO',
                origenId: $pago->getPagoId()
            ));
        }

        // 5. Guardar estado actualizado del pago
        $this->pagoRepository->guardar($pago);

        // 6. Publicar Evento SAGA en Outbox (pago.confirmado)
        $outbox = new OutboxEvento(
            eventoId: Uuid::uuid4()->toString(),
            tipoEvento: 'pago.confirmado',
            payload: [
                'pagoId' => $pago->getPagoId(),
                'reservaId' => $pago->getReservaId(),
                'sagaId' => $pago->getSagaId(),
                'transaccionBancariaRef' => $dto->transaccionBancariaRef,
                'montoTotal' => $pago->getMontoTotal(),
                'timestamp' => (new \DateTimeImmutable())->format('c')
            ]
        );
        $this->outboxRepository->guardar($outbox);

        return [
            'pago' => PagoResponseDTO::fromEntity($pago),
            'comision' => [
                'comisionId' => $comision->getComisionId(),
                'baseComisionable' => $comision->getBaseComisionable(),
                'porcentajeAplicado' => $comision->getPorcentajeAplicado(),
                'montoComision' => $comision->getMontoComision(),
                'montoNetoAnfitrion' => $comision->getMontoNetoAnfitrion(),
                'estado' => $comision->getEstado()
            ],
            'asientoContableId' => $asientoId,
            'sagaStatus' => 'PAGO_CONFIRMADO_DESPACHADO'
        ];
    }
}
