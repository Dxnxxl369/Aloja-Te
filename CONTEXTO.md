# ALOJA-TE BOLIVIA — DOCUMENTO DE CONTEXTO Y ARQUITECTURA

**Proyecto:** Plataforma Digital de Alojamientos y Experiencias Turísticas en Bolivia  
**Versión del Ecosistema:** 2.0 Multi-Cloud & Local  
**Metodología de Desarrollo:** ICONIX Process | Clean Architecture | Domain-Driven Design (DDD)

---

## 1. Visión General del Software

**Aloja-Te Bolivia** es una plataforma integral de reservas, hospedaje y gestión turística diseñada específicamente para el mercado boliviano. Resuelve la desconexión entre anfitriones locales (hoteles, cabañas, casas de campo, departamentos boutique) y viajeros nacionales/internacionales, adaptando la experiencia financiera a la realidad boliviana (pagos mediante QR Simple interoperable, transferencias bancarias y liquidaciones en moneda nacional Bs.).

El software opera bajo un modelo de tres perfiles canónicos con portales independientes:
1. **Cliente / Huésped (`:3000`):** Explora el catálogo geolocalizado por departamentos, consulta disponibilidad en tiempo real, genera reservas con códigos PIN confidenciales y realiza pagos.
2. **Anfitrión / Operador (`:3005`):** Publica propiedades mediante un asistente por pasos, gestiona habitaciones/unidades, audita reservas entrantes y valida el ingreso de huéspedes mediante recepción de código PIN.
3. **Administrador de la Plataforma (`:4200`):** Supervisa la moderación de alojamientos, audita el libro contable de partida doble, aprueba liquidaciones y gestiona el padrón general de usuarios.

---

## 2. Arquitectura de Microservicios y Ecosistema Técnico

El sistema está desacoplado en microservicios independientes que se comunican mediante protocolos HTTP REST, eventos asíncronos y un Gateway central:

```
                          ┌───────────────────────────┐
                          │   PORTAL CLIENTES (:3000) │
                          │   PORTAL ANFITRIÓN (:3005)│
                          │   PORTAL ADMIN (:4200)    │
                          └─────────────┬─────────────┘
                                        │
                                        ▼
                          ┌───────────────────────────┐
                          │   API GATEWAY (:8080)     │
                          │   (Express + SSO + Proxy) │
                          └─────────────┬─────────────┘
                                        │
        ┌───────────────────┬───────────┴───────────┬───────────────────┐
        ▼                   ▼                       ▼                   ▼
┌───────────────┐   ┌───────────────┐       ┌───────────────┐   ┌───────────────┐
│     MS-01     │   │     MS-02     │       │     MS-03     │   │     MS-04     │
│   Usuarios    │   │  Reservas y   │       │  Comercial y  │   │     IA &      │
│ Alojamientos  │   │   Estadías    │       │  Financiero   │   │   Copiloto    │
│(Spring Boot)  │   │   (NestJS)    │       │   (Laravel)   │   │   (FastAPI)   │
│    :3001      │   │    :3002      │       │     :3003     │   │     :3004     │
└───────┬───────┘   └───────┬───────┘       └───────┬───────┘   └───────┬───────┘
        │                   │                       │                   │
        ▼                   ▼                       ▼                   ▼
  PostgreSQL 17       DynamoDB Local          PostgreSQL 17        Gemini / LLM
 (`ms1-usuarios`)     / In-Memory       (`ms3-pagos_comercios`)     LLaVA Guard
```

### Detalle de los Microservicios:
* **API Gateway Central (`:8080` - Node.js Express):**  
  Punto de entrada único. Administra el enrutamiento a cada microservicio, normaliza las respuestas, centraliza el Single Sign-On (SSO) y orquesta la comunicación con el flujo de moderación de n8n.
* **MS-01: Usuarios, Alojamientos y Catálogos (`:3001` - Java Spring Boot):**  
  Implementa Arquitectura Hexagonal (Ports & Adapters). Maneja la autenticación segura (BCrypt), el ciclo de vida del alojamiento (`BORRADOR`, `PENDIENTE_MODERACION`, `PUBLICADO`, `RECHAZADO`), unidades reservables y valoraciones. Base de datos: **PostgreSQL (`ms1-usuarios`)**.
* **MS-02: Reservas y Estadías (`:3002` - NestJS TypeScript):**  
  Gestiona el inventario de fechas, disponibilidad y ciclo de vida de la reserva (`CREADA`, `PAGADA`, `CONFIRMADA`, `CHECK_IN_COMPLETADO`, `CHECK_OUT_COMPLETADO`). Base de datos: **Amazon DynamoDB (Local / Memoria)**.
* **MS-03: Comercial y Financiero (`:3003` - PHP Laravel DDD):**  
  Maneja la lógica financiera, comisiones de plataforma, libro diario contable de partida doble y generación de comprobantes para transferencias y QR. Base de datos: **PostgreSQL (`ms3-pagos_comercios`)**.
* **MS-04: IA y Copiloto (`:3004` - Python FastAPI):**  
  Proporciona asistencia conversacional turística y análisis semántico impulsado por modelos generativos.

---

## 3. Flujo Integral de Creación y Moderación Automatizada con IA

Cuando un anfitrión publica una propiedad, la plataforma asegura la seguridad y calidad del contenido mediante una cadena de moderación automática:

```
[Anfitrión crea Alojamiento]
            │
            ▼
[MS-01: Estado PENDIENTE_MODERACION]
            │
            ▼
[Disparo de Webhook a n8n / Gateway] ──> [Inspección de Imágenes con IA]
                                               │
                                               ├─ ¿Detecta Armas/Contenido Peligroso?
                                               │   ├── SÍ ──> Estado: RECHAZADO
                                               │   │          Envío de Correo con Motivo
                                               │   │
                                               │   └── NO ──> Estado: PUBLICADO / APROBADO
                                               │              Listo para recibir Reservas
```

### Paso a paso del flujo:
1. **Registro del Alojamiento:** El anfitrión completa los datos en el portal `:3005` (título, descripción, departamento, precio por noche, reglas y fotografías).
2. **Estado Inicial:** El microservicio MS-01 almacena la entidad con estado operativo `PENDIENTE_MODERACION`.
3. **Automatización n8n / LLaVA Guard / Gemini Vision:**  
   * El Gateway y el worker de moderación consumen las fotografías subidas.
   * Se ejecuta un análisis visual multivariante mediante modelos de visión (Google Gemini / LLaVA Guard) buscando infracciones de seguridad: armas de fuego, contenido explícito o fotografías no aptas para hotelería.
4. **Decisión Automática:**
   * **Rechazado:** Si la IA detecta un elemento prohibido (ej. armas o armas simuladas), el estado cambia automáticamente a `RECHAZADO` y se despacha un correo electrónico informativo al anfitrión con el motivo del rechazo.
   * **Aprobado:** Si las fotos son legítimas, el estado pasa a `PUBLICADO` y el alojamiento se indexa de inmediato en el catálogo de huéspedes.

---

## 4. Flujo de Reserva y Validación por PIN Secreto

El proceso de compra y estadía une los tres microfrontends sin fricciones:

1. **Búsqueda y Selección (`:3000`):** El cliente visualiza el alojamiento aprobado, revisa fotografías, selecciona el rango de fechas (`checkIn` - `checkOut`) y hace clic en "Reservar".
2. **Generación de la Reserva y PIN Secreto:**  
   * MS-02 bloquea el inventario de fechas para evitar colisiones (overbooking).
   * Se genera un **Código PIN confidencial** de 6 dígitos único para la estadía.
3. **Pago Simulado (QR / Transferencia Bancaria):**  
   * El cliente elige el método de pago:
     * **QR Simple:** Se presenta el código QR oficial de la plataforma con el importe exacto.
     * **Transferencia Bancaria:** Se muestran los datos de la cuenta de la empresa (Banco, Número de Cuenta, Titular).
   * Al confirmar el pago, la reserva pasa a estado `CONFIRMADA`.
4. **Recepción en Portal Anfitrión (`:3005`):**  
   * La reserva confirmada aparece instantáneamente en el módulo **"Recepción & PIN"** bajo la pestaña **"PENDIENTES"**.
   * El anfitrión visualiza el nombre del cliente, las fechas y la habitación asignada.
5. **Check-in Físico mediante PIN:**  
   * Al llegar el cliente al alojamiento, entrega su código PIN al anfitrión.
   * El anfitrión digita el PIN en su portal `:3005`; al coincidir, el sistema marca el check-in como completado (`CHECK_IN_COMPLETADO`), habilitando la liquidación financiera en MS-03.

---

## 5. Control de Sesión, SSO y Aislamiento por Navegador

Para garantizar la integridad del sistema tanto en desarrollo local como en demostraciones multi-rol, la arquitectura de autenticación opera bajo las siguientes reglas:

### Aislamiento Estricto por Navegador (Zero Cross-Contamination)
* **Tokens JWT Independientes:** Cada navegador (Chrome, Edge, Firefox, Incógnito) mantiene su propio token y perfil en su `localStorage` local (`alojate_jwt_token` y `alojate_user_profile`).
* **Validación en Gateway:** El Gateway no comparte variables de sesión globales en memoria para peticiones anónimas. Valida exclusivamente el token portado en el header `Authorization: Bearer <token>`.
* **Persistencia en Recargas:** Al presionar `Ctrl + Shift + R` o `F5`, la aplicación lee su propio token local y valida con el servidor, manteniendo la sesión del usuario activo sin cerrarse ni pisar a otros navegadores.

### Control de Acceso Basado en Roles (RBAC) y Seguridad entre Puertos
Cada portal web está restringido al rol correspondiente para evitar escalamiento de privilegios:

| Puerto | Portal | Rol Requerido | Comportamiento si el Rol es Incorrecto |
| :--- | :--- | :--- | :--- |
| `:3000` | Portal Clientes | `CLIENTE` / Público | Acceso abierto para exploración; requiere login para reservar. |
| `:3005` | Portal Anfitrión | `ANFITRION` | Si ingresa un `CLIENTE`, se bloquea el acceso mostrando pantalla de **"Acceso Denegado (403)"** con botón de retorno a `:3000`. |
| `:4200` | Portal Admin | `ADMINISTRADOR` | Si ingresa un `CLIENTE` o `ANFITRION`, se rechaza el acceso con pantalla de **"No Autorizado (403)"**. |

---

## 6. Persistencia y Almacenamiento Local

El ecosistema está configurado para operar de forma 100% autónoma en el entorno local:
* **PostgreSQL Local (`localhost:5432`):**
  * Base de datos `ms1-usuarios`: Tablas de usuarios, roles, empresas, alojamientos, unidades y fotos.
  * Base de datos `ms3-pagos_comercios`: Tablas de órdenes de pago, reglas comerciales y libro diario contable.
* **DynamoDB Local (`localhost:8000`):** Almacenamiento no relacional rápido de reservas y bloqueos temporales de fechas con fallback resiliente en memoria.
* **Archivos y Credenciales:** Totalmente aislados, sin requerir conexión obligatoria a bases de datos en la nube para las operaciones básicas del examen.
