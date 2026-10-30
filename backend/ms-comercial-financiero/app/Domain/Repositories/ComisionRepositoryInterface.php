<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\Comision;

interface ComisionRepositoryInterface
{
    public function guardar(Comision $comision): void;
    public function buscarPorId(string $comisionId): ?Comision;
    public function buscarPorPagoId(string $pagoId): ?Comision;
    /** @return Comision[] */
    public function listarPendientesPorAnfitrion(string $anfitrionId): array;
}
