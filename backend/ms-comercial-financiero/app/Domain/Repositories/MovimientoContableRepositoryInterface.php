<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\MovimientoContable;

interface MovimientoContableRepositoryInterface
{
    public function guardar(MovimientoContable $movimiento): void;
    /** @return MovimientoContable[] */
    public function listarPorAsiento(string $asientoId): array;
    /** @return MovimientoContable[] */
    public function listarTodos(): array;
}
