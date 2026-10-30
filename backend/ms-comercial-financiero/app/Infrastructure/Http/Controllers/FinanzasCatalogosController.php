<?php

namespace App\Infrastructure\Http\Controllers;

use App\Domain\Repositories\ReglaMonetizacionRepositoryInterface;
use App\Domain\Repositories\PromocionRepositoryInterface;

class FinanzasCatalogosController
{
    public function __construct(
        private readonly ReglaMonetizacionRepositoryInterface $reglaRepository,
        private readonly PromocionRepositoryInterface $promocionRepository
    ) {}

    public function listarReglas(): array
    {
        $reglas = $this->reglaRepository->listarTodas();
        return array_map(fn($r) => [
            'reglaId' => $r->getReglaId(),
            'concepto' => $r->getConcepto()->value,
            'tipoCalculo' => $r->getTipoCalculo()->value,
            'porcentaje' => $r->getPorcentaje(),
            'categoriaAlojamiento' => $r->getCategoriaAlojamiento(),
            'vigenteDesde' => $r->getVigenteDesde()?->format('c'),
            'vigenteHasta' => $r->getVigenteHasta()?->format('c')
        ], $reglas);
    }

    public function validarPromocion(string $codigo): array
    {
        $promocion = $this->promocionRepository->buscarPorCodigo($codigo);
        if ($promocion === null) {
            http_response_code(404);
            return ['error' => "Código promocional '{$codigo}' no encontrado o inválido."];
        }

        return [
            'promocionId' => $promocion->getPromocionId(),
            'codigo' => $promocion->getCodigo(),
            'tipo' => $promocion->getTipo(),
            'tipoDescuento' => $promocion->getTipoDescuento()->value,
            'valor' => $promocion->getValor(),
            'vigenteDesde' => $promocion->getVigenteDesde()->format('c'),
            'vigenteHasta' => $promocion->getVigenteHasta()->format('c'),
            'estado' => $promocion->getEstado()
        ];
    }
}
