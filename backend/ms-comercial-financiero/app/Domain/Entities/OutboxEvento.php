<?php

namespace App\Domain\Entities;

use DateTimeImmutable;

class OutboxEvento
{
    private string $eventoId;
    private string $tipoEvento;
    private array $payload;
    private ?DateTimeImmutable $publicadoEn;
    private DateTimeImmutable $createdAt;

    public function __construct(
        string $eventoId,
        string $tipoEvento,
        array $payload,
        ?DateTimeImmutable $publicadoEn = null,
        ?DateTimeImmutable $createdAt = null
    ) {
        $this->eventoId = $eventoId;
        $this->tipoEvento = $tipoEvento;
        $this->payload = $payload;
        $this->publicadoEn = $publicadoEn;
        $this->createdAt = $createdAt ?? new DateTimeImmutable();
    }

    public function marcarPublicado(): void
    {
        $this->publicadoEn = new DateTimeImmutable();
    }

    public function getEventoId(): string { return $this->eventoId; }
    public function getTipoEvento(): string { return $this->tipoEvento; }
    public function getPayload(): array { return $this->payload; }
    public function getPublicadoEn(): ?DateTimeImmutable { return $this->publicadoEn; }
    public function getCreatedAt(): DateTimeImmutable { return $this->createdAt; }
}
