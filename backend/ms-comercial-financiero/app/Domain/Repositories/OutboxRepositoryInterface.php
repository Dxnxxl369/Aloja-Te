<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\OutboxEvento;

interface OutboxRepositoryInterface
{
    public function guardar(OutboxEvento $evento): void;
    /** @return OutboxEvento[] */
    public function listarNoPublicados(): array;
    public function marcarComoPublicado(string $eventoId): void;
}
