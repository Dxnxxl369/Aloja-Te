# Aloja-Te Bolivia - Guia del Proyecto

Plataforma de alojamientos y reservas en Bolivia, dividida en microservicios (backend) y microfrontends (frontend).

---

## OJO IMPORTANTE: Bases de Datos Oficiales

Las bases de datos oficiales y obligatorias del proyecto son:
- MS-01 (Usuarios y Alojamientos): PostgreSQL (puerto 5432, base de datos: `alojate_usuarios`)
- MS-02 (Reservas y Estadias): Amazon DynamoDB (tabla single-table `ReservasEstadias`, local en puerto 8000 o AWS)
- MS-03 (Comercial y Financiero): PostgreSQL (puerto 5432, base de datos: `alojate_financiero`)

NOTA PARA EL EQUIPO:
H2 y SQLite solo estuvieron configurados de forma temporal como fallback de pruebas locales. Ya NO se debe usar ni H2 ni SQLite, no es practico para la entrega.

Cada integrante del equipo debe crear sus bases de datos en su gestor correspondiente (PostgreSQL y DynamoDB) antes de levantar el backend:
1. Levantar PostgreSQL (vía Docker o instalación local) y crear las bases de datos.
2. Configurar sus credenciales de conexion (usuario, contraseña y host) en `backend/ms-usuarios-alojamientos/src/main/resources/application.yml` y en `backend/ms-comercial-financiero/.env`.
3. Para DynamoDB en MS-02, levantar DynamoDB Local o configurar sus credenciales de AWS.
4. Cada quien puede pedirle a su propia IA (ChatGPT, Claude, Gemini, Copilot) que le ayude a crear la base de datos o le arme el script segun estos archivos del repo y listo.

---

## 1. Arquitecturas y Microservicios (Backend)

Todos los servicios corren de forma desacoplada e independiente:

- Gateway API (Puerto 8080)
  - Stack: Node.js / Express / TypeScript
  - Que hace: Es la puerta de entrada unica. Recibe las peticiones del frontend y las redirige al microservicio correspondiente, manejando CORS y rutas.

- MS-01: Usuarios y Alojamientos (Puerto 3001)
  - Arquitectura: Hexagonal (Puertos y Adaptadores)
  - Stack: Java 17 / Spring Boot 3
  - Base de datos oficial: PostgreSQL
  - Que hace: Maneja login, registro con validacion de anfitriones, catalogo de alojamientos, distincion entre Casa (oferta unica) vs Hotel (multiples habitaciones) y la bandeja de moderacion para que el admin apruebe o rechace publicaciones.

- MS-02: Reservas y Estadias (Puerto 3002)
  - Arquitectura: Clean Architecture
  - Stack: NestJS / TypeScript
  - Base de datos oficial: Amazon DynamoDB
  - Que hace: Controla la disponibilidad de fechas, el bloqueo temporal de reserva (15 min), el check-in seguro con PIN de 6 digitos y el estado de la estadia del huesped.

- MS-03: Comercial y Financiero (Puerto 3003)
  - Arquitectura: Domain-Driven Design (DDD)
  - Stack: PHP 8.2 / Laravel 10
  - Base de datos oficial: PostgreSQL
  - Que hace: Procesa cobros con QR Simple BNB, calcula la comision del 10% de la plataforma, lleva la contabilidad en partida doble y genera las liquidaciones bancarias ACH para pagarle a los anfitriones.

- MS-IA: Copiloto y Analitica (Puerto 8000)
  - Stack: Python / FastAPI
  - Que hace: Genera reportes ejecutivos con predicciones de demanda turistica y deteccion de anomalias.

- BFF Admin (Puerto 3004 / integrado en Gateway)
  - Que hace: Backend intermedio para alimentar los datos del panel administrativo.

---

## 2. Microfrontends (Frontend)

El frontend esta separado en aplicaciones independientes con paleta Azul y Blanco y soporte de Modo Oscuro:

- portal-clientes (Puerto 3000)
  - Stack: React 18 / Vite / Tailwind CSS
  - Que hace: Es la app principal para viajeros y anfitriones.
    - Catalogo con filtros por los 9 departamentos de Bolivia.
    - Pantalla completa de detalle de alojamiento con galeria de fotos, desglose de habitaciones para hoteles y tarjeta flotante para reservar.
    - Wizard de 5 pasos para que los anfitriones publiquen casas u hoteles con fotos e inventario.
    - Validacion de PIN de Check-in para anfitriones.
    - Pasarela de pago simulada con QR Simple BNB.

- portal-admin (Puerto 4200)
  - Stack: Angular 17 / Tailwind CSS
  - Que hace: Panel institucional del administrador.
    - Verificacion y auditoria tecnica de alojamientos con pantalla amplia de inspeccion para aprobar o rechazar con motivo.
    - Conciliacion contable y libro diario (ingresos QR vs pagos a anfitriones).
    - Desembolsos masivos ACH a cuentas bancarias de anfitriones.
    - Reportes inteligentes generados con IA.

- shell-mfe (Puerto 9000)
  - Stack: Single-SPA
  - Que hace: Orquestador base que une los microfrontends si se desea ejecutarlos como una sola aplicacion.

- app-movil
  - Stack: React Native / Expo
  - Que hace: App movil de apoyo para ver reservas y mostrar el PIN de ingreso en recepcion.

---

## 3. Como Correr los Servicios

### Backend

Abrir una terminal para cada uno:

1. Gateway:
   cd backend/gateway-api
   pnpm install
   npx ts-node src/index.ts

2. MS-01 Usuarios y Alojamientos:
   cd backend/ms-usuarios-alojamientos
   mvn spring-boot:run

3. MS-02 Reservas y Estadias:
   cd backend/ms-reservas-estadias
   pnpm install
   pnpm start:dev

4. MS-03 Comercial y Financiero:
   cd backend/ms-comercial-financiero
   composer install
   php artisan serve --port=3003

### Frontend

Abrir una terminal para cada uno:

1. Portal Clientes:
   cd frontend/portal-clientes
   pnpm install
   pnpm dev
   (Abrir http://localhost:3000)

2. Portal Admin:
   cd frontend/portal-admin
   pnpm install
   pnpm start
   (Abrir http://localhost:4200)

---

## 4. Usuarios de Prueba

- Anfitrion: carlos.mendoza@alojate.bo / Anfitrion2026!
- Huesped: lucia.paredes@gmail.com / Huesped2026!
- Administrador: admin@alojate.bo / AdminAloja2026!
