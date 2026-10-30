<?php

namespace App\Domain\Enums;

enum EstadoPago: string
{
    case PENDIENTE = 'PENDIENTE';
    case COMPLETADO = 'COMPLETADO';
    case FALLIDO = 'FALLIDO';
    case REEMBOLSADO = 'REEMBOLSADO';
}
