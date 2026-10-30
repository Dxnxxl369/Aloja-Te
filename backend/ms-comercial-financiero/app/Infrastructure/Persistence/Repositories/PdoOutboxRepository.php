<?php

namespace App\Infrastructure\Persistence\Repositories;

use App\Domain\Entities\OutboxEvento;
use App\Domain\Repositories\OutboxRepositoryInterface;
use App\Infrastructure\Persistence\PdoDatabase;
use PDO;
use DateTimeImmutable;

class PdoOutboxRepository implements OutboxRepositoryInterface
{
    private PDO $db;

    public function __construct()
    {
        $this->db = PdoDatabase::getInstance();
    }

    public function guardar(OutboxEvento $evento): void
    {
        $stmt = $this->db->prepare("INSERT INTO outbox_eventos 
            (evento_id, tipo_evento, payload, publicado_en, created_at)
            VALUES (:id, :tipo, :payload, :pub, :created)");
        
        $stmt->execute([
            'id' => $evento->getEventoId(),
            'tipo' => $evento->getTipoEvento(),
            'payload' => json_encode($evento->getPayload(), JSON_UNESCAPED_UNICODE),
            'pub' => $evento->getPublicadoEn()?->format('Y-m-d H:i:s'),
            'created' => $evento->getCreatedAt()->format('Y-m-d H:i:s')
        ]);
    }

    public function listarNoPublicados(): array
    {
        $stmt = $this->db->query("SELECT * FROM outbox_eventos WHERE publicado_en IS NULL ORDER BY created_at ASC");
        $rows = $stmt->fetchAll();
        return array_map([$this, 'mapRowToEntity'], $rows);
    }

    public function marcarComoPublicado(string $eventoId): void
    {
        $stmt = $this->db->prepare("UPDATE outbox_eventos SET publicado_en = CURRENT_TIMESTAMP WHERE evento_id = :id");
        $stmt->execute(['id' => $eventoId]);
    }

    private function mapRowToEntity(array $row): OutboxEvento
    {
        return new OutboxEvento(
            eventoId: $row['evento_id'],
            tipoEvento: $row['tipo_evento'],
            payload: json_decode($row['payload'], true) ?? [],
            publicadoEn: $row['publicado_en'] ? new DateTimeImmutable($row['publicado_en']) : null,
            createdAt: new DateTimeImmutable($row['created_at'])
        );
    }
}
