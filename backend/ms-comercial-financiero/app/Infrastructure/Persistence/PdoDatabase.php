<?php

namespace App\Infrastructure\Persistence;

use PDO;
use PDOException;

class PdoDatabase
{
    private static ?PDO $instance = null;

    public static function getInstance(): PDO
    {
        if (self::$instance === null) {
            $driver = getenv('DB_CONNECTION') ?: 'sqlite';
            $host = getenv('DB_HOST') ?: '127.0.0.1';
            $port = getenv('DB_PORT') ?: '5432';
            $database = getenv('DB_DATABASE') ?: 'alojate_comercial';
            $username = getenv('DB_USERNAME') ?: 'postgres';
            $password = getenv('DB_PASSWORD') ?: 'postgres';

            if ($driver === 'pgsql') {
                try {
                    $dsn = "pgsql:host={$host};port={$port};dbname={$database}";
                    self::$instance = new PDO($dsn, $username, $password, [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                    ]);
                } catch (PDOException $e) {
                    // Fallback to SQLite if PostgreSQL database does not exist yet
                    $sqlitePath = dirname(__DIR__, 2) . '/database/database.sqlite';
                    self::$instance = new PDO("sqlite:{$sqlitePath}", null, null, [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                    ]);
                }
            } else {
                $sqlitePath = dirname(__DIR__, 2) . '/database/database.sqlite';
                if (!file_exists(dirname($sqlitePath))) {
                    mkdir(dirname($sqlitePath), 0777, true);
                }
                self::$instance = new PDO("sqlite:{$sqlitePath}", null, null, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                ]);
            }

            self::inicializarEsquema(self::$instance);
        }

        return self::$instance;
    }

    private static function inicializarEsquema(PDO $pdo): void
    {
        // 1. ref_anfitrion
        $pdo->exec("CREATE TABLE IF NOT EXISTS ref_anfitriones (
            anfitrion_id VARCHAR(36) PRIMARY KEY,
            nombre_completo VARCHAR(255) NOT NULL,
            nit VARCHAR(50),
            estado_verificacion VARCHAR(50) DEFAULT 'VERIFICADO'
        )");

        // 2. metodo_cobro_anfitrion
        $pdo->exec("CREATE TABLE IF NOT EXISTS metodo_cobro_anfitriones (
            metodo_id VARCHAR(36) PRIMARY KEY,
            anfitrion_id VARCHAR(36) NOT NULL,
            tipo VARCHAR(50) NOT NULL,
            numero_cifrado VARCHAR(255) NOT NULL,
            es_principal BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        // 3. regla_monetizacion
        $pdo->exec("CREATE TABLE IF NOT EXISTS reglas_monetizacion (
            regla_id VARCHAR(36) PRIMARY KEY,
            concepto VARCHAR(50) NOT NULL,
            tipo_calculo VARCHAR(50) NOT NULL,
            porcentaje DECIMAL(10,2) NOT NULL,
            categoria_alojamiento VARCHAR(100),
            vigente_desde TIMESTAMP,
            vigente_hasta TIMESTAMP
        )");

        // 4. acuerdo_comercial
        $pdo->exec("CREATE TABLE IF NOT EXISTS acuerdos_comerciales (
            acuerdo_id VARCHAR(36) PRIMARY KEY,
            anfitrion_id VARCHAR(36) NOT NULL,
            regla_comision_id VARCHAR(36) NOT NULL,
            estado VARCHAR(50) DEFAULT 'ACTIVO',
            fecha_inicio TIMESTAMP,
            fecha_fin TIMESTAMP,
            dias_liquidacion INT DEFAULT 7,
            condiciones TEXT
        )");

        // 5. promocion
        $pdo->exec("CREATE TABLE IF NOT EXISTS promociones (
            promocion_id VARCHAR(36) PRIMARY KEY,
            codigo VARCHAR(50) UNIQUE NOT NULL,
            tipo VARCHAR(50) NOT NULL,
            tipo_descuento VARCHAR(50) NOT NULL,
            valor DECIMAL(10,2) NOT NULL,
            vigente_desde TIMESTAMP,
            vigente_hasta TIMESTAMP,
            estado VARCHAR(50) DEFAULT 'ACTIVA'
        )");

        // 6. promocion_alojamiento
        $pdo->exec("CREATE TABLE IF NOT EXISTS promociones_alojamientos (
            promocion_id VARCHAR(36) NOT NULL,
            alojamiento_id VARCHAR(36) NOT NULL,
            PRIMARY KEY (promocion_id, alojamiento_id)
        )");

        // 7. ref_reserva
        $pdo->exec("CREATE TABLE IF NOT EXISTS ref_reservas (
            reserva_id VARCHAR(36) PRIMARY KEY,
            cliente_id VARCHAR(36) NOT NULL,
            alojamiento_id VARCHAR(36) NOT NULL,
            fecha_checkin TIMESTAMP,
            fecha_checkout TIMESTAMP,
            estado VARCHAR(50) NOT NULL
        )");

        // 8. pago
        $pdo->exec("CREATE TABLE IF NOT EXISTS pagos (
            pago_id VARCHAR(36) PRIMARY KEY,
            reserva_id VARCHAR(36) NOT NULL,
            anfitrion_id VARCHAR(36) NOT NULL,
            promocion_id VARCHAR(36),
            subtotal_alojamiento DECIMAL(12,2) NOT NULL,
            descuento DECIMAL(12,2) DEFAULT 0.0,
            cargo_servicio DECIMAL(12,2) DEFAULT 0.0,
            monto_total DECIMAL(12,2) NOT NULL,
            estado VARCHAR(50) NOT NULL,
            idempotency_key VARCHAR(100) UNIQUE NOT NULL,
            saga_id VARCHAR(36) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        // 9. transaccion_pago
        $pdo->exec("CREATE TABLE IF NOT EXISTS transacciones_pago (
            transaccion_id VARCHAR(36) PRIMARY KEY,
            pago_id VARCHAR(36) NOT NULL,
            tipo VARCHAR(50) NOT NULL,
            monto DECIMAL(12,2) NOT NULL,
            referencia_pasarela VARCHAR(100) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        // 10. comprobante
        $pdo->exec("CREATE TABLE IF NOT EXISTS comprobantes (
            comprobante_id VARCHAR(36) PRIMARY KEY,
            pago_id VARCHAR(36) NOT NULL,
            tipo VARCHAR(50) NOT NULL,
            numero VARCHAR(100) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        // 11. liquidacion
        $pdo->exec("CREATE TABLE IF NOT EXISTS liquidaciones (
            liquidacion_id VARCHAR(36) PRIMARY KEY,
            anfitrion_id VARCHAR(36) NOT NULL,
            metodo_id VARCHAR(36) NOT NULL,
            periodo_desde TIMESTAMP NOT NULL,
            periodo_hasta TIMESTAMP NOT NULL,
            total_bruto DECIMAL(12,2) NOT NULL,
            total_comisiones DECIMAL(12,2) NOT NULL,
            total_neto DECIMAL(12,2) NOT NULL,
            estado VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        // 12. comision
        $pdo->exec("CREATE TABLE IF NOT EXISTS comisiones (
            comision_id VARCHAR(36) PRIMARY KEY,
            pago_id VARCHAR(36) NOT NULL,
            regla_id VARCHAR(36) NOT NULL,
            liquidacion_id VARCHAR(36),
            base_comisionable DECIMAL(12,2) NOT NULL,
            porcentaje_aplicado DECIMAL(6,2) NOT NULL,
            monto_comision DECIMAL(12,2) NOT NULL,
            monto_neto_anfitrion DECIMAL(12,2) NOT NULL,
            estado VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        // 13. reembolso
        $pdo->exec("CREATE TABLE IF NOT EXISTS reembolsos (
            reembolso_id VARCHAR(36) PRIMARY KEY,
            pago_id VARCHAR(36) NOT NULL,
            monto DECIMAL(12,2) NOT NULL,
            motivo TEXT NOT NULL,
            estado VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        // 14. conciliacion
        $pdo->exec("CREATE TABLE IF NOT EXISTS conciliaciones (
            conciliacion_id VARCHAR(36) PRIMARY KEY,
            pasarela VARCHAR(50) NOT NULL,
            fecha_corte TIMESTAMP NOT NULL,
            diferencia DECIMAL(12,2) DEFAULT 0.0,
            estado VARCHAR(50) NOT NULL
        )");

        // 15. conciliacion_item
        $pdo->exec("CREATE TABLE IF NOT EXISTS conciliacion_items (
            item_id VARCHAR(36) PRIMARY KEY,
            conciliacion_id VARCHAR(36) NOT NULL,
            transaccion_id VARCHAR(36) NOT NULL,
            resultado VARCHAR(50) NOT NULL
        )");

        // 16. movimiento_contable
        $pdo->exec("CREATE TABLE IF NOT EXISTS movimientos_contables (
            movimiento_id INTEGER PRIMARY KEY AUTOINCREMENT,
            asiento_id VARCHAR(36) NOT NULL,
            cuenta VARCHAR(150) NOT NULL,
            tipo VARCHAR(20) NOT NULL,
            monto DECIMAL(12,2) NOT NULL,
            origen_tipo VARCHAR(50) NOT NULL,
            origen_id VARCHAR(36) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        // 17. outbox_evento
        $pdo->exec("CREATE TABLE IF NOT EXISTS outbox_eventos (
            evento_id VARCHAR(36) PRIMARY KEY,
            tipo_evento VARCHAR(100) NOT NULL,
            payload TEXT NOT NULL,
            publicado_en TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        // 18. evento_procesado
        $pdo->exec("CREATE TABLE IF NOT EXISTS eventos_procesados (
            mensaje_id VARCHAR(36) PRIMARY KEY,
            tipo_evento VARCHAR(100) NOT NULL,
            origen VARCHAR(100) NOT NULL,
            procesado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        // Semillas iniciales si no existen
        self::autoseed($pdo);
    }

    private static function autoseed(PDO $pdo): void
    {
        $stmt = $pdo->query("SELECT COUNT(*) FROM reglas_monetizacion");
        if ((int) $stmt->fetchColumn() === 0) {
            // Regla de Comisión Anfitrión: 10%
            $pdo->exec("INSERT INTO reglas_monetizacion (regla_id, concepto, tipo_calculo, porcentaje, categoria_alojamiento, vigente_desde)
                VALUES ('11111111-1111-1111-1111-111111111111', 'COMISION', 'PORCENTAJE', 10.0, 'ESTANDAR', CURRENT_TIMESTAMP)");

            // Regla de Cargo por Servicio Huésped: 5%
            $pdo->exec("INSERT INTO reglas_monetizacion (regla_id, concepto, tipo_calculo, porcentaje, categoria_alojamiento, vigente_desde)
                VALUES ('22222222-2222-2222-2222-222222222222', 'CARGO_SERVICIO', 'PORCENTAJE', 5.0, 'ESTANDAR', CURRENT_TIMESTAMP)");

            // Promoción de Bienvenida: BIENVENIDO2026 (10% descuento)
            $pdo->exec("INSERT INTO promociones (promocion_id, codigo, tipo, tipo_descuento, valor, vigente_desde, vigente_hasta, estado)
                VALUES ('33333333-3333-3333-3333-333333333333', 'BIENVENIDO2026', 'LANZAMIENTO', 'PORCENTAJE', 10.0, CURRENT_TIMESTAMP, '2026-12-31 23:59:59', 'ACTIVA')");

            // Anfitrión de demostración
            $pdo->exec("INSERT OR IGNORE INTO ref_anfitriones (anfitrion_id, nombre_completo, nit, estado_verificacion)
                VALUES ('5211de5d-bd9e-4cb7-8912-3fbf6a0184b0', 'Carlos Mendoza', '4839201019', 'VERIFICADO')");
        }
    }
}
