<?php

namespace App\Infrastructure\Http\Controllers;

use App\Application\UseCases\GenerarLiquidacionAnfitrionUseCase;
use App\Domain\Repositories\LiquidacionRepositoryInterface;
use App\Domain\Repositories\MovimientoContableRepositoryInterface;
use App\Infrastructure\Messaging\RabbitMQSagaPublisher;

class LiquidacionController
{
    public function __construct(
        private readonly GenerarLiquidacionAnfitrionUseCase $liquidacionUseCase,
        private readonly LiquidacionRepositoryInterface $liquidacionRepository,
        private readonly MovimientoContableRepositoryInterface $contabilidadRepository,
        private readonly RabbitMQSagaPublisher $sagaPublisher
    ) {}

    public function generarLiquidacion(array $body): array
    {
        if (empty($body['anfitrionId'])) {
            http_response_code(400);
            return ['error' => 'El campo anfitrionId es obligatorio.'];
        }

        $metodoId = $body['metodoId'] ?? null;
        $resultado = $this->liquidacionUseCase->ejecutar($body['anfitrionId'], $metodoId);
        $this->sagaPublisher->publicarOutboxPendientes();

        http_response_code(200);
        return $resultado;
    }

    public function listarPorAnfitrion(string $anfitrionId): array
    {
        $liquidaciones = $this->liquidacionRepository->listarPorAnfitrion($anfitrionId);
        return array_map(fn($l) => [
            'liquidacionId' => $l->getLiquidacionId(),
            'anfitrionId' => $l->getAnfitrionId(),
            'metodoId' => $l->getMetodoId(),
            'periodoDesde' => $l->getPeriodoDesde()->format('Y-m-d'),
            'periodoHasta' => $l->getPeriodoHasta()->format('Y-m-d'),
            'totalBruto' => $l->getTotalBruto(),
            'totalComisiones' => $l->getTotalComisiones(),
            'totalNeto' => $l->getTotalNeto(),
            'estado' => $l->getEstado()->value,
            'createdAt' => $l->getCreatedAt()->format('c')
        ], $liquidaciones);
    }

    public function listarMovimientosContables(): array
    {
        $movimientos = $this->contabilidadRepository->listarTodos();
        return array_map(fn($m) => [
            'movimientoId' => $m->getMovimientoId(),
            'asientoId' => $m->getAsientoId(),
            'cuenta' => $m->getCuenta(),
            'tipo' => $m->getTipo()->value,
            'monto' => $m->getMonto(),
            'origenTipo' => $m->getOrigenTipo(),
            'origenId' => $m->getOrigenId(),
            'createdAt' => $m->getCreatedAt()->format('c')
        ], $movimientos);
    }
}
