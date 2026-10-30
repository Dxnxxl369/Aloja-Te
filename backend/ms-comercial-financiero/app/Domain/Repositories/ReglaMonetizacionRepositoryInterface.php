<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\ReglaMonetizacion;

interface ReglaMonetizacionRepositoryInterface
{
    public function guardar(ReglaMonetizacion $regla): void;
    public function buscarPorId(string $reglaId): ?ReglaMonetizacion;
    public function buscarVigentePorCategoria(string $concepto, ?string $categoria = null): ?ReglaMonetizacion;
    /** @return ReglaMonetizacion[] */
    public function listarTodas(): array;
}
