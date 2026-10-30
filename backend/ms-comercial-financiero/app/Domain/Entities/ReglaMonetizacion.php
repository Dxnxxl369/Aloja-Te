<?php

namespace App\Domain\Entities;

use App\Domain\Enums\ConceptoMonetizacion;
use App\Domain\Enums\TipoCalculo;
use DateTimeImmutable;

class ReglaMonetizacion
{
    private string $reglaId;
    private ConceptoMonetizacion $concepto;
    private TipoCalculo $tipoCalculo;
    private float $porcentaje;
    private ?string $categoriaAlojamiento;
    private ?DateTimeImmutable $vigenteDesde;
    private ?DateTimeImmutable $vigenteHasta;

    public function __construct(
        string $reglaId,
        ConceptoMonetizacion $concepto,
        TipoCalculo $tipoCalculo,
        float $porcentaje,
        ?string $categoriaAlojamiento = null,
        ?DateTimeImmutable $vigenteDesde = null,
        ?DateTimeImmutable $vigenteHasta = null
    ) {
        $this->reglaId = $reglaId;
        $this->concepto = $concepto;
        $this->tipoCalculo = $tipoCalculo;
        $this->porcentaje = $porcentaje;
        $this->categoriaAlojamiento = $categoriaAlojamiento;
        $this->vigenteDesde = $vigenteDesde ?? new DateTimeImmutable();
        $this->vigenteHasta = $vigenteHasta;
    }

    public function calcularMonto(float $base): float
    {
        if ($this->tipoCalculo === TipoCalculo::PORCENTAJE) {
            return round($base * ($this->porcentaje / 100.0), 2);
        }
        return round($this->porcentaje, 2);
    }

    public function getReglaId(): string { return $this->reglaId; }
    public function getConcepto(): ConceptoMonetizacion { return $this->concepto; }
    public function getTipoCalculo(): TipoCalculo { return $this->tipoCalculo; }
    public function getPorcentaje(): float { return $this->porcentaje; }
    public function getCategoriaAlojamiento(): ?string { return $this->categoriaAlojamiento; }
    public function getVigenteDesde(): ?DateTimeImmutable { return $this->vigenteDesde; }
    public function getVigenteHasta(): ?DateTimeImmutable { return $this->vigenteHasta; }
}
