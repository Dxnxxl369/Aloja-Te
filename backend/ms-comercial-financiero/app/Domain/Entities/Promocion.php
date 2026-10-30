<?php

namespace App\Domain\Entities;

use App\Domain\Enums\TipoCalculo;
use DateTimeImmutable;

class Promocion
{
    private string $promocionId;
    private string $codigo;
    private string $tipo;
    private TipoCalculo $tipoDescuento;
    private float $valor;
    private DateTimeImmutable $vigenteDesde;
    private DateTimeImmutable $vigenteHasta;
    private string $estado;
    /** @var string[] */
    private array $alojamientosIds = [];

    public function __construct(
        string $promocionId,
        string $codigo,
        string $tipo,
        TipoCalculo $tipoDescuento,
        float $valor,
        DateTimeImmutable $vigenteDesde,
        DateTimeImmutable $vigenteHasta,
        string $estado = 'ACTIVA'
    ) {
        $this->promocionId = $promocionId;
        $this->codigo = strtoupper($codigo);
        $this->tipo = $tipo;
        $this->tipoDescuento = $tipoDescuento;
        $this->valor = $valor;
        $this->vigenteDesde = $vigenteDesde;
        $this->vigenteHasta = $vigenteHasta;
        $this->estado = $estado;
    }

    public function calcularDescuento(float $subtotal): float
    {
        $ahora = new DateTimeImmutable();
        if ($this->estado !== 'ACTIVA' || $ahora < $this->vigenteDesde || $ahora > $this->vigenteHasta) {
            return 0.0;
        }

        if ($this->tipoDescuento === TipoCalculo::PORCENTAJE) {
            return round($subtotal * ($this->valor / 100.0), 2);
        }

        return min($this->valor, $subtotal);
    }

    public function asociarAlojamiento(string $alojamientoId): void
    {
        if (!in_array($alojamientoId, $this->alojamientosIds, true)) {
            $this->alojamientosIds[] = $alojamientoId;
        }
    }

    public function getPromocionId(): string { return $this->promocionId; }
    public function getCodigo(): string { return $this->codigo; }
    public function getTipo(): string { return $this->tipo; }
    public function getTipoDescuento(): TipoCalculo { return $this->tipoDescuento; }
    public function getValor(): float { return $this->valor; }
    public function getVigenteDesde(): DateTimeImmutable { return $this->vigenteDesde; }
    public function getVigenteHasta(): DateTimeImmutable { return $this->vigenteHasta; }
    public function getEstado(): string { return $this->estado; }
    public function getAlojamientosIds(): array { return $this->alojamientosIds; }
}
