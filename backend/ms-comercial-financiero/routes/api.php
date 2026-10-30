<?php

use App\Infrastructure\Http\Controllers\PagoController;
use App\Infrastructure\Http\Controllers\LiquidacionController;
use App\Infrastructure\Http\Controllers\FinanzasCatalogosController;
use App\Infrastructure\Persistence\Repositories\PdoPagoRepository;
use App\Infrastructure\Persistence\Repositories\PdoComisionRepository;
use App\Infrastructure\Persistence\Repositories\PdoLiquidacionRepository;
use App\Infrastructure\Persistence\Repositories\PdoReglaMonetizacionRepository;
use App\Infrastructure\Persistence\Repositories\PdoPromocionRepository;
use App\Infrastructure\Persistence\Repositories\PdoMovimientoContableRepository;
use App\Infrastructure\Persistence\Repositories\PdoOutboxRepository;
use App\Infrastructure\Messaging\RabbitMQSagaPublisher;
use App\Application\UseCases\ProcesarPagoUseCase;
use App\Application\UseCases\ConfirmarPagoWebhookUseCase;
use App\Application\UseCases\GenerarLiquidacionAnfitrionUseCase;
use App\Application\UseCases\ProcesarReembolsoSagaUseCase;

// Dependency Injection Wiring
$pagoRepo = new PdoPagoRepository();
$comisionRepo = new PdoComisionRepository();
$liquidacionRepo = new PdoLiquidacionRepository();
$reglaRepo = new PdoReglaMonetizacionRepository();
$promocionRepo = new PdoPromocionRepository();
$contabilidadRepo = new PdoMovimientoContableRepository();
$outboxRepo = new PdoOutboxRepository();
$sagaPublisher = new RabbitMQSagaPublisher($outboxRepo);

$procesarPagoUC = new ProcesarPagoUseCase($pagoRepo, $promocionRepo, $reglaRepo, $outboxRepo);
$confirmarPagoUC = new ConfirmarPagoWebhookUseCase($pagoRepo, $comisionRepo, $reglaRepo, $contabilidadRepo, $outboxRepo);
$liquidacionUC = new GenerarLiquidacionAnfitrionUseCase($comisionRepo, $liquidacionRepo, $contabilidadRepo, $outboxRepo);
$reembolsoUC = new ProcesarReembolsoSagaUseCase($pagoRepo, $contabilidadRepo, $outboxRepo);

$pagoController = new PagoController($procesarPagoUC, $confirmarPagoUC, $reembolsoUC, $pagoRepo, $sagaPublisher);
$liquidacionController = new LiquidacionController($liquidacionUC, $liquidacionRepo, $contabilidadRepo, $sagaPublisher);
$catalogosController = new FinanzasCatalogosController($reglaRepo, $promocionRepo);

// Request parsing
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$rawBody = file_get_contents('php://input');
$body = json_decode($rawBody, true) ?? [];

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Router Dispatcher
$response = null;

// Health check
if ($uri === '/health' || $uri === '/api/v1/finanzas/health') {
    $response = ['status' => 'healthy', 'service' => 'MS-03 Comercial y Financiero (Laravel DDD)', 'timestamp' => date('c')];
}
// Pagos
elseif ($method === 'POST' && ($uri === '/api/v1/pagos' || $uri === '/api/v1/pagos/')) {
    $response = $pagoController->procesarPago($body);
}
elseif ($method === 'POST' && preg_match('#^/api/v1/pagos/webhook/(bnb|qr|pasarela)$#', $uri)) {
    $response = $pagoController->confirmarPagoWebhook($body);
}
elseif ($method === 'POST' && preg_match('#^/api/v1/pagos/([^/]+)/confirmar$#', $uri, $matches)) {
    $body['pagoId'] = $matches[1];
    $response = $pagoController->confirmarPagoWebhook($body);
}
elseif ($method === 'POST' && preg_match('#^/api/v1/pagos/([^/]+)/reembolsar$#', $uri, $matches)) {
    $response = $pagoController->procesarReembolso($matches[1], $body);
}
elseif ($method === 'GET' && preg_match('#^/api/v1/pagos/([^/]+)$#', $uri, $matches)) {
    $response = $pagoController->obtenerPorId($matches[1]);
}
elseif ($method === 'GET' && ($uri === '/api/v1/pagos' || $uri === '/api/v1/pagos/')) {
    $response = $pagoController->listarTodos();
}
// Liquidaciones y Contabilidad
elseif ($method === 'POST' && ($uri === '/api/v1/finanzas/liquidaciones' || $uri === '/api/v1/finanzas/liquidaciones/')) {
    $response = $liquidacionController->generarLiquidacion($body);
}
elseif ($method === 'GET' && preg_match('#^/api/v1/finanzas/liquidaciones/([^/]+)$#', $uri, $matches)) {
    $response = $liquidacionController->listarPorAnfitrion($matches[1]);
}
elseif ($method === 'GET' && ($uri === '/api/v1/finanzas/contabilidad' || $uri === '/api/v1/finanzas/contabilidad/')) {
    $response = $liquidacionController->listarMovimientosContables();
}
// Catálogos y Reglas
elseif ($method === 'GET' && ($uri === '/api/v1/finanzas/reglas' || $uri === '/api/v1/finanzas/reglas/')) {
    $response = $catalogosController->listarReglas();
}
elseif ($method === 'GET' && preg_match('#^/api/v1/finanzas/promociones/([^/]+)$#', $uri, $matches)) {
    $response = $catalogosController->validarPromocion($matches[1]);
}
else {
    http_response_code(404);
    $response = ['error' => 'Ruta no encontrada en MS-03', 'metodo' => $method, 'uri' => $uri];
}

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
