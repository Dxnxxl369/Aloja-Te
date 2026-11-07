<?php

namespace App\Infrastructure\Http;

use App\Domain\Exceptions\PagoRechazadoException;
use App\Domain\Services\ReservaConsultaInterface;

/**
 * Consulta GET {GATEWAY_URL}/api/v1/reservas/{id} pasando por el API Gateway, como el resto del sistema.
 *
 * GATEWAY_URL por defecto: http://localhost:8080
 * (Si otro programa ocupa el 8080 por IPv4, apunta a http://[::1]:8080 o libera el puerto.)
 */
class ReservasHttpClient implements ReservaConsultaInterface
{
    private const TIMEOUT_CONEXION_S = 3;
    private const TIMEOUT_TOTAL_S = 6;

    public function __construct(private readonly ?string $baseUrl = null)
    {
    }

    public function obtener(string $reservaId): ?array
    {
        $base = rtrim($this->baseUrl ?? (getenv('GATEWAY_URL') ?: 'http://localhost:8080'), '/');
        $url = $base . '/api/v1/reservas/' . rawurlencode($reservaId);

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => self::TIMEOUT_CONEXION_S,
            CURLOPT_TIMEOUT => self::TIMEOUT_TOTAL_S,
            CURLOPT_HTTPHEADER => ['Accept: application/json', 'X-Correlation-Id: ' . $reservaId],
        ]);
        $cuerpo = curl_exec($ch);
        $estado = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $falloRed = $cuerpo === false;
        curl_close($ch);

        if ($falloRed || $estado >= 500 || $estado === 0) {
            throw new PagoRechazadoException(
                'No se pudo verificar la reserva en este momento. No se realizó ningún cobro; inténtalo de nuevo.',
                503,
                'RESERVAS_NO_DISPONIBLE'
            );
        }
        if ($estado === 404) {
            return null;
        }

        $datos = json_decode((string) $cuerpo, true);
        // Cualquier otra respuesta que no sea una reserva (p. ej. una página de otro servidor) no sirve para cobrar.
        if ($estado !== 200 || !is_array($datos) || !isset($datos['idReserva'])) {
            throw new PagoRechazadoException(
                'La respuesta de reservas no es válida. No se realizó ningún cobro.',
                502,
                'RESERVAS_RESPUESTA_INVALIDA'
            );
        }
        return $datos;
    }
}
