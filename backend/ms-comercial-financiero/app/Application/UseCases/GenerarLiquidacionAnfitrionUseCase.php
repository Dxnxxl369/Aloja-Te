<?php

namespace App\Application\UseCases;

use App\Domain\Entities\Liquidacion;
use App\Domain\Entities\MovimientoContable;
use App\Domain\Entities\OutboxEvento;
use App\Domain\Enums\EstadoLiquidacion;
use App\Domain\Enums\TipoMovimientoContable;
use App\Domain\Repositories\ComisionRepositoryInterface;
use App\Domain\Repositories\LiquidacionRepositoryInterface;
use App\Domain\Repositories\MovimientoContableRepositoryInterface;
use App\Domain\Repositories\OutboxRepositoryInterface;
use Ramsey\Uuid\Uuid;

class GenerarLiquidacionAnfitrionUseCase
{
    public function __construct(
        private readonly ComisionRepositoryInterface $comisionRepository,
        private readonly LiquidacionRepositoryInterface $liquidacionRepository,
        private readonly MovimientoContableRepositoryInterface $contabilidadRepository,
        private readonly OutboxRepositoryInterface $outboxRepository
    ) {}

    public function ejecutar(string $anfitrionId, ?string $metodoId = null): array
    {
        $comisiones = $this->comisionRepository->listarPendientesPorAnfitrion($anfitrionId);
        if (empty($comisiones)) {
            return [
                'mensaje' => 'No existen comisiones pendientes de liquidación para este anfitrión.',
                'totalNeto' => 0.0
            ];
        }

        $totalBruto = 0.0;
        $totalComisiones = 0.0;
        foreach ($comisiones as $c) {
            $totalBruto += $c->getBaseComisionable();
            $totalComisiones += $c->getMontoComision();
        }

        $liquidacionId = Uuid::uuid4()->toString();
        $metodoIdEfectivo = $metodoId ?? Uuid::uuid4()->toString();
        $desde = new \DateTimeImmutable('-7 days');
        $hasta = new \DateTimeImmutable();

        $liquidacion = new Liquidacion(
            liquidacionId: $liquidacionId,
            anfitrionId: $anfitrionId,
            metodoId: $metodoIdEfectivo,
            periodoDesde: $desde,
            periodoHasta: $hasta,
            totalBruto: $totalBruto,
            totalComisiones: $totalComisiones,
            estado: EstadoLiquidacion::PROCESADA
        );

        $this->liquidacionRepository->guardar($liquidacion);

        // Asociar cada comisión a la liquidación
        foreach ($comisiones as $c) {
            $c->asociarLiquidacion($liquidacionId);
            $this->comisionRepository->guardar($c);
        }

        // Asiento contable de pago a anfitrión
        $asientoId = Uuid::uuid4()->toString();
        // DEBE: Pasivo con anfitrión disminuye
        $this->contabilidadRepository->guardar(new MovimientoContable(
            asientoId: $asientoId,
            cuenta: '2.1.2.01 - Cuentas por Pagar a Anfitriones',
            tipo: TipoMovimientoContable::DEBITO,
            monto: $liquidacion->getTotalNeto(),
            origenTipo: 'LIQUIDACION',
            origenId: $liquidacionId
        ));

        // HABER: Salida de banco al anfitrión
        $this->contabilidadRepository->guardar(new MovimientoContable(
            asientoId: $asientoId,
            cuenta: '1.1.1.01 - Banco BNB Cuenta Fiscal',
            tipo: TipoMovimientoContable::CREDITO,
            monto: $liquidacion->getTotalNeto(),
            origenTipo: 'LIQUIDACION',
            origenId: $liquidacionId
        ));

        // Outbox event
        $outbox = new OutboxEvento(
            eventoId: Uuid::uuid4()->toString(),
            tipoEvento: 'liquidacion.procesada',
            payload: [
                'liquidacionId' => $liquidacionId,
                'anfitrionId' => $anfitrionId,
                'totalNeto' => $liquidacion->getTotalNeto(),
                'comisionesCount' => count($comisiones),
                'timestamp' => (new \DateTimeImmutable())->format('c')
            ]
        );
        $this->outboxRepository->guardar($outbox);

        return [
            'liquidacionId' => $liquidacionId,
            'anfitrionId' => $anfitrionId,
            'periodoDesde' => $desde->format('Y-m-d'),
            'periodoHasta' => $hasta->format('Y-m-d'),
            'totalBruto' => $totalBruto,
            'totalComisionesPlataforma' => $totalComisiones,
            'totalNetoTransferido' => $liquidacion->getTotalNeto(),
            'estado' => $liquidacion->getEstado()->value,
            'comisionesLiquidadas' => count($comisiones),
            'asientoContableId' => $asientoId
        ];
    }
}
