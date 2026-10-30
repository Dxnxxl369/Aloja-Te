<?php

namespace App\Domain\Entities;

use DateTimeImmutable;

class RefAnfitrion
{
    private string $anfitrionId;
    private string $nombreCompleto;
    private string $nit;
    private string $estadoVerificacion;

    public function __construct(
        string $anfitrionId,
        string $nombreCompleto,
        string $nit,
        string $estadoVerificacion = 'VERIFICADO'
    ) {
        $this->anfitrionId = $anfitrionId;
        $this->nombreCompleto = $nombreCompleto;
        $this->nit = $nit;
        $this->estadoVerificacion = $estadoVerificacion;
    }

    public function getAnfitrionId(): string { return $this->anfitrionId; }
    public function getNombreCompleto(): string { return $this->nombreCompleto; }
    public function getNit(): string { return $this->nit; }
    public function getEstadoVerificacion(): string { return $this->estadoVerificacion; }
}
