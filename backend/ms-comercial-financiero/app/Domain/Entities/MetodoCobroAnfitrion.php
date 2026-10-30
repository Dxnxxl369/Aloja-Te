<?php

namespace App\Domain\Entities;

use App\Domain\Enums\TipoMetodoCobro;
use DateTimeImmutable;

class MetodoCobroAnfitrion
{
    private string $metodoId;
    private string $anfitrionId;
    private TipoMetodoCobro $tipo;
    private string $numeroCifrado;
    private bool $esPrincipal;
    private DateTimeImmutable $createdAt;

    public function __construct(
        string $metodoId,
        string $anfitrionId,
        TipoMetodoCobro $tipo,
        string $numeroCifrado,
        bool $esPrincipal = true,
        ?DateTimeImmutable $createdAt = null
    ) {
        $this->metodoId = $metodoId;
        $this->anfitrionId = $anfitrionId;
        $this->tipo = $tipo;
        $this->numeroCifrado = $numeroCifrado;
        $this->esPrincipal = $esPrincipal;
        $this->createdAt = $createdAt ?? new DateTimeImmutable();
    }

    public function getMetodoId(): string { return $this->metodoId; }
    public function getAnfitrionId(): string { return $this->anfitrionId; }
    public function getTipo(): TipoMetodoCobro { return $this->tipo; }
    public function getNumeroCifrado(): string { return $this->numeroCifrado; }
    public function isEsPrincipal(): bool { return $this->esPrincipal; }
    public function getCreatedAt(): DateTimeImmutable { return $this->createdAt; }
}
