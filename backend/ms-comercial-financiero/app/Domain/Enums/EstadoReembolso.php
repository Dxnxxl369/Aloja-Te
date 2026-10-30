<?php

namespace App\Domain\Enums;

enum EstadoReembolso: string
{
    case PENDIENTE = 'PENDIENTE';
    case PROCESADO = 'PROCESADO';
    case RECHAZADO = 'RECHAZADO';
}
