<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\Pago;

interface PagoRepositoryInterface
{
    public function guardar(Pago $pago): void;
    public function buscarPorId(string $pagoId): ?Pago;
    public function buscarPorReservaId(string $reservaId): ?Pago;
    public function buscarPorIdempotencyKey(string $idempotencyKey): ?Pago;
    /** @return Pago[] */
    public function listarTodos(): array;
}
