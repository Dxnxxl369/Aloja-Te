<?php

namespace App\Domain\Entities;

use DateTimeImmutable;

class EventoProcesado
{
    private string $mensajeId;
    private string $tipoEvento;
    private string $origen;
    private DateTimeImmutable $procesadoEn;

    public function __construct(
        string $mensajeId,
        string $tipoEvento,
        string $origen,
        ?DateTimeImmutable $procesadoEn = null
    ) {
        $this->mensajeId = $mensajeId;
        $this->tipoEvento = $tipoEvento;
        $this->origen = $origen;
        $this->procesadoEn = $procesadoEn ?? new DateTimeImmutable();
    }

    public function getMensajeId(): string { return $this->mensajeId; }
    public function getTipoEvento(): string { return $this->tipoEvento; }
    public function getOrigen(): string { return $this->origen; }
    public function getProcesadoEn(): DateTimeImmutable { return $this->procesadoEn; }
}
