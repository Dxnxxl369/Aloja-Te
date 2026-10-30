<?php

namespace App\Infrastructure\Messaging;

use App\Domain\Entities\OutboxEvento;
use App\Domain\Repositories\OutboxRepositoryInterface;
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

class RabbitMQSagaPublisher
{
    private ?AMQPStreamConnection $connection = null;
    private string $exchange = 'alojate.reservas.saga';

    public function __construct(
        private readonly OutboxRepositoryInterface $outboxRepository
    ) {}

    public function publicarOutboxPendientes(): int
    {
        $eventos = $this->outboxRepository->listarNoPublicados();
        $publicados = 0;

        foreach ($eventos as $evento) {
            $this->publicarEvento($evento);
            $this->outboxRepository->marcarComoPublicado($evento->getEventoId());
            $publicados++;
        }

        return $publicados;
    }

    public function publicarEvento(OutboxEvento $evento): void
    {
        $host = getenv('RABBITMQ_HOST') ?: '127.0.0.1';
        $port = (int) (getenv('RABBITMQ_PORT') ?: 5672);
        $user = getenv('RABBITMQ_USER') ?: 'guest';
        $pass = getenv('RABBITMQ_PASSWORD') ?: 'guest';

        try {
            if ($this->connection === null) {
                $this->connection = new AMQPStreamConnection($host, $port, $user, $pass, '/', false, 'AMQPLAIN', null, 'en_US', 2.0, 2.0);
            }

            $channel = $this->connection->channel();
            $channel->exchange_declare($this->exchange, 'topic', false, true, false);

            $msg = new AMQPMessage(
                json_encode([
                    'eventoId' => $evento->getEventoId(),
                    'tipoEvento' => $evento->getTipoEvento(),
                    'origen' => 'ms-comercial-financiero',
                    'payload' => $evento->getPayload()
                ], JSON_UNESCAPED_UNICODE),
                ['content_type' => 'application/json', 'delivery_mode' => AMQPMessage::DELIVERY_MODE_PERSISTENT]
            );

            $routingKey = "finanzas.{$evento->getTipoEvento()}";
            $channel->basic_publish($msg, $this->exchange, $routingKey);
            $channel->close();
        } catch (\Throwable $e) {
            $storageDir = dirname(__DIR__, 3) . '/storage';
            if (!is_dir($storageDir)) {
                mkdir($storageDir, 0777, true);
            }
            file_put_contents(
                $storageDir . '/saga_events.log',
                sprintf("[%s] [AMQP_FALLBACK] %s -> %s\n", date('c'), $evento->getTipoEvento(), json_encode($evento->getPayload())),
                FILE_APPEND
            );
        }
    }
}
