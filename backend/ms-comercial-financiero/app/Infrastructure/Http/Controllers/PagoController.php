<?php

namespace App\Infrastructure\Http\Controllers;

use App\Application\DTOs\ProcesarPagoDTO;
use App\Application\DTOs\ConfirmarPagoDTO;
use App\Application\DTOs\PagoResponseDTO;
use App\Application\UseCases\ProcesarPagoUseCase;
use App\Application\UseCases\ConfirmarPagoWebhookUseCase;
use App\Application\UseCases\ProcesarReembolsoSagaUseCase;
use App\Domain\Repositories\PagoRepositoryInterface;
use App\Infrastructure\Messaging\RabbitMQSagaPublisher;

class PagoController
{
    public function __construct(
        private readonly ProcesarPagoUseCase $procesarPagoUseCase,
        private readonly ConfirmarPagoWebhookUseCase $confirmarPagoUseCase,
        private readonly ProcesarReembolsoSagaUseCase $reembolsoUseCase,
        private readonly PagoRepositoryInterface $pagoRepository,
        private readonly RabbitMQSagaPublisher $sagaPublisher
    ) {}

    public function procesarPago(array $body): array
    {
        if (empty($body['reservaId']) || empty($body['anfitrionId']) || !isset($body['subtotal'])) {
            http_response_code(400);
            return ['error' => 'Faltan campos obligatorios: reservaId, anfitrionId, subtotal.'];
        }

        $dto = ProcesarPagoDTO::fromArray($body);
        $resultado = $this->procesarPagoUseCase->ejecutar($dto);
        $this->sagaPublisher->publicarOutboxPendientes();

        http_response_code(201);
        return $resultado;
    }

    public function confirmarPagoWebhook(array $body): array
    {
        if (empty($body['pagoId'])) {
            http_response_code(400);
            return ['error' => 'El campo pagoId es obligatorio.'];
        }

        $dto = ConfirmarPagoDTO::fromArray($body);
        $resultado = $this->confirmarPagoUseCase->ejecutar($dto);
        $this->sagaPublisher->publicarOutboxPendientes();

        http_response_code(200);
        return $resultado;
    }

    public function procesarReembolso(string $reservaId, array $body): array
    {
        $monto = isset($body['monto']) ? (float) $body['monto'] : null;
        $motivo = $body['motivo'] ?? 'Cancelación de estadía vía SAGA';

        $resultado = $this->reembolsoUseCase->ejecutar($reservaId, $monto, $motivo);
        $this->sagaPublisher->publicarOutboxPendientes();

        http_response_code(200);
        return $resultado;
    }

    public function obtenerPorId(string $id): array
    {
        $pago = $this->pagoRepository->buscarPorId($id);
        if ($pago === null) {
            $pago = $this->pagoRepository->buscarPorReservaId($id);
        }

        if ($pago === null) {
            http_response_code(404);
            return ['error' => "Pago no encontrado con identificador {$id}"];
        }

        return PagoResponseDTO::fromEntity($pago);
    }

    public function listarTodos(): array
    {
        $pagos = $this->pagoRepository->listarTodos();
        return array_map(fn($p) => PagoResponseDTO::fromEntity($p), $pagos);
    }
}
