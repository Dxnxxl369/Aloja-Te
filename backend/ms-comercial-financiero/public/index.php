<?php

require_once __DIR__ . '/../vendor/autoload.php';

if (file_exists(__DIR__ . '/../.env')) {
    try {
        $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
        $dotenv->load();
    } catch (Throwable $e) {
        // Fallback en caso de que ya estuvieran cargadas
    }
}

require_once __DIR__ . '/../routes/api.php';
