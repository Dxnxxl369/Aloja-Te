<?php

namespace App\Domain\Entities;

use DateTimeImmutable;

class AcuerdoComercial
{
    private string $acuerdoId;
    private string $anfitrionId;
    private string $reglaComisionId;
    private string $estado;
    private DateTimeImmutable $fechaInicio;
    private ?DateTimeImmutable $fechaFin;
    private int $diasLiquidacion;
    private array $condiciones;

    public function __construct(
        string $acuerdoId,
        string $anfitrionId,
        string $reglaComisionId,
        string $estado = 'ACTIVO',
        ?DateTimeImmutable $fechaInicio = null,
        ?DateTimeImmutable $fechaFin = null,
        int $diasLiquidacion = 7,
        array $condiciones = []
    ) {
        $this->acuerdoId = $acuerdoId;
        $this->anfitrionId = $anfitrionId;
        $this->reglaComisionId = $reglaComisionId;
        $this->estado = $estado;
        $this->fechaInicio = $fechaInicio ?? new DateTimeImmutable();
        $this->fechaFin = $fechaFin;
        $this->diasLiquidacion = $diasLiquidacion;
        $this->condiciones = $condiciones;
    }

    public function getAcuerdoId(): string { return $this->acuerdoId; }
    public function getAnfitrionId(): string { return $this->anfitrionId; }
    public function getReglaComisionId(): string { return $this->reglaComisionId; }
    public function getEstado(): string { return $this->estado; }
    public function getFechaInicio(): DateTimeImmutable { return $this->fechaInicio; }
    public function getFechaFin(): ?DateTimeImmutable { return $this->fechaFin; }
    public function getDiasLiquidacion(): int { return $this->diasLiquidacion; }
    public function getCondiciones(): array { return $this->condiciones; }
}
