<?php

namespace App\Domain\Services;

/**
 * Cómo MS-03 consulta una reserva de MS-02 antes de cobrarla.
 * El dominio no sabe si es por HTTP, por el Gateway o por otra vía.
 */
interface ReservaConsultaInterface
{
    /**
     * @return array<string,mixed>|null La reserva tal como la entrega MS-02, o null si no existe.
     * @throws \App\Domain\Exceptions\PagoRechazadoException (503) si MS-02 no responde: sin saber el
     *         estado de la reserva no se cobra.
     */
    public function obtener(string $reservaId): ?array;
}
