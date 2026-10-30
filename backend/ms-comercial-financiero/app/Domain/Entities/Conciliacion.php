<?php

namespace App\Domain\Entities;

use App\Domain\Enums\ResultadoConciliacion;
use DateTimeImmutable;

class Conciliacion
{
    private string $conciliacionId;
    private string $pasarela;
    private DateTimeImmutable $fechaCorte;
    private float $diferencia;
    private string $estado;
    /** @var ConciliacionItem[] */
    private array $items = [];

    public function __construct(
        string $conciliacionId,
        string $pasarela,
        DateTimeImmutable $fechaCorte,
        float $diferencia = 0.0,
        string $estado = 'PENDIENTE'
    ) {
        $this->conciliacionId = $conciliacionId;
        $this->pasarela = $pasarela;
        $this->fechaCorte = $fechaCorte;
        $this->diferencia = $diferencia;
        $this->estado = $estado;
    }

    public function agregarItem(string $itemId, string $transaccionId, ResultadoConciliacion $resultado): ConciliacionItem
    {
        $item = new ConciliacionItem($itemId, $this->conciliacionId, $transaccionId, $resultado);
        $this->items[] = $item;
        return $item;
    }

    public function getConciliacionId(): string { return $this->conciliacionId; }
    public function getPasarela(): string { return $this->pasarela; }
    public function getFechaCorte(): DateTimeImmutable { return $this->fechaCorte; }
    public function getDiferencia(): float { return $this->diferencia; }
    public function getEstado(): string { return $this->estado; }
    public function getItems(): array { return $this->items; }
}

class ConciliacionItem
{
    private string $itemId;
    private string $conciliacionId;
    private string $transaccionId;
    private ResultadoConciliacion $resultado;

    public function __construct(
        string $itemId,
        string $conciliacionId,
        string $transaccionId,
        ResultadoConciliacion $resultado
    ) {
        $this->itemId = $itemId;
        $this->conciliacionId = $conciliacionId;
        $this->transaccionId = $transaccionId;
        $this->resultado = $resultado;
    }

    public function getItemId(): string { return $this->itemId; }
    public function getConciliacionId(): string { return $this->conciliacionId; }
    public function getTransaccionId(): string { return $this->transaccionId; }
    public function getResultado(): ResultadoConciliacion { return $this->resultado; }
}
