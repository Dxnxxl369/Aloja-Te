<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\Liquidacion;

interface LiquidacionRepositoryInterface
{
    public function guardar(Liquidacion $liquidacion): void;
    public function buscarPorId(string $liquidacionId): ?Liquidacion;
    /** @return Liquidacion[] */
    public function listarPorAnfitrion(string $anfitrionId): array;
}
