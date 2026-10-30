<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\Promocion;

interface PromocionRepositoryInterface
{
    public function guardar(Promocion $promocion): void;
    public function buscarPorCodigo(string $codigo): ?Promocion;
    public function buscarPorId(string $promocionId): ?Promocion;
}
