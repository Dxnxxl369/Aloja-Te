<?php

namespace App\Domain\Enums;

enum ResultadoConciliacion: string
{
    case CONCILIADO = 'CONCILIADO';
    case DISCREPANCIA = 'DISCREPANCIA';
    case NO_ENCONTRADO = 'NO_ENCONTRADO';
}
