# 🌐 GUÍA MAESTRA DE DESPLIEGUE MULTI-CLOUD: ALOJA-TE
### Distribución Oficial: AWS (MS1 + Gateway) | Azure (MS2 + BFF GraphQL) | Google Cloud (MS3)

Esta guía está diseñada para que los **3 integrantes del equipo** y sus **Agentes de IA (Antigravity, Cursor, Claude Code, etc.)** puedan levantar cada microservicio en su respectiva nube, configurar la seguridad de red, intercambiar sus IPs públicas y enlazar todo a través del **API Gateway** y los frontends en **Vercel**.

---

## 🗺️ 1. MAPA DE ARQUITECTURA Y PUERTOS

```text
                                 ┌─────────────────────────────────────────────────────────────┐
                                 │                   USUARIOS / CLIENTES                      │
                                 │           (3 Frontends en Vercel / App Móvil Expo)          │
                                 └──────────────────────────────┬──────────────────────────────┘
                                                                │ HTTP :8080 (VITE_API_GATEWAY_URL)
                                                                ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ NUBE 1: AMAZON WEB SERVICES (AWS) - Compañero 1                                                                         │
│ Instancia: t3.micro (Capa Gratuita con Swap)                                                                            │
│                                                                                                                         │
│   ┌───────────────────────────────────────────────────────────────────────────────────┐                                 │
│   │  API GATEWAY (Puerto 8080)                                                        │                                 │
│   │  Enrutador central y proxy inverso hacia todos los microservicios                 │                                 │
│   └───────┬──────────────────────────────┬─────────────────────────────────────┬──────┘                                 │
│           │ Localhost :3001              │ HTTP :3002                          │ HTTP :3003                             │
│           ▼                              │                                     │                                        │
│   ┌───────────────────────────────┐      │                                     │                                        │
│   │ MS-01: Usuarios & Alojamiento │      │                                     │                                        │
│   │ (Spring Boot / Java 17) :3001 │      │                                     │                                        │
│   │ DB: PostgreSQL :5432          │      │                                     │                                        │
│   └───────────────────────────────┘      │                                     │                                        │
└──────────────────────────────────────────┼─────────────────────────────────────┼────────────────────────────────────────┘
                                           │                                     │
                                           ▼                                     ▼
┌──────────────────────────────────────────────────┐  ┌───────────────────────────────────────────────────────────────────┐
│ NUBE 2: MICROSOFT AZURE - Compañero 2 (Daniel)   │  │ NUBE 3: GOOGLE CLOUD (GCP) - Compañero 3                          │
│                                                  │  │                                                                   │
│   ┌──────────────────────────────────────────┐   │  │   ┌───────────────────────────────────────────────────────────┐   │
│   │ MS-02: Reservas & Estadías               │   │  │   │ MS-03: Comercial & Financiero                             │   │
│   │ (NestJS / Node 20) :3002                 │   │  │   │ (Laravel / PHP 8.2) :3003                                 │   │
│   │ DB: DynamoDB Local en Docker (:8000)     │   │  │   │ DB: PostgreSQL :5432                                      │   │
│   └──────────────────────────────────────────┘   │  │   └───────────────────────────────────────────────────────────┘   │
│                                                  │  └───────────────────────────────────────────────────────────────────┘
│   ┌──────────────────────────────────────────┐   │
│   │ BFF-ADMIN: GraphQL API                   │   │
│   │ (Apollo Server) :4000                    │   │
│   │ Consulta agregada a MS1, MS2 y MS3       │   │
│   └──────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

---

## ☁️ 2. GUÍA COMPAÑERO 1: AMAZON WEB SERVICES (AWS)
**Responsabilidad:** `ms-usuarios-alojamientos` (Puerto 3001) + `gateway-api` (Puerto 8080).

### Paso 1: Crear la Instancia EC2 en AWS Console
1. Entra a **EC2** $\rightarrow$ **Launch Instance** (Lanzar instancia).
2. **Nombre:** `alojate-aws-core`
3. **AMI (Sistema Operativo):** `Ubuntu Server 24.04 LTS` o `Ubuntu 22.04 LTS` (64-bit x86).
4. **Tipo de Instancia:** `t3.micro` (**Capa Gratuita** - 1 vCPU, 1GB RAM) o `t3.small` / `t3.medium`.
   > **Nota clave:** En `t3.micro` se activará un archivo Swap de 2GB a 4GB para que Maven y Java compilen sin ningún problema de memoria.
5. **Key pair (Par de claves):**
   * Crear nuevo par de claves: `alojate-aws-key.pem` (tipo RSA).
   * **Descargar y guardar este archivo `.pem`** (se lo pasarás a tu Agente de IA).
6. **Almacenamiento (Storage):** 20 GB o 30 GB gp3 (incluido en capa gratuita).
7. **Security Group (Reglas de Firewall Inbound):**
   Crear grupo de seguridad con los siguientes puertos entrantes (Source: `0.0.0.0/0`):
   * `TCP 22` $\rightarrow$ SSH (Acceso remoto)
   * `TCP 80` $\rightarrow$ HTTP
   * `TCP 443` $\rightarrow$ HTTPS
   * `TCP 8080` $\rightarrow$ **API Gateway (Vital: este es el puerto público principal)**
   * `TCP 3001` $\rightarrow$ **MS-01 Usuarios (Spring Boot)**
8. **Asignar IP Fija:** Ve a **Network & Security** $\rightarrow$ **Elastic IPs** $\rightarrow$ Allocate Elastic IP $\rightarrow$ Associate con tu instancia `alojate-aws-core`.
   *(Anota esta IP: ej. `54.210.15.20`)*.

---

### 🤖 PROMPT PARA EL AGENTE DE IA (COMPAÑERO 1 - AWS)
Copia y pega este texto directamente a tu agente de IA junto con el archivo `alojate-aws-key.pem` y la IP pública de tu servidor:

```markdown
Eres el DevOps Engineer de Aloja-Te en AWS.
Accede por SSH a mi servidor Ubuntu con la siguiente información:
- Host: [PEGA_AQUÍ_LA_IP_ELASTICA_DE_AWS]
- Usuario: ubuntu
- Llave SSH: alojate-aws-key.pem

OBJETIVO:
Desplegar PostgreSQL, el backend MS-01 (Spring Boot) en el puerto 3001 y el API Gateway en el puerto 8080.

INSTRUCCIONES QUE DEBES EJECUTAR:
1. Configurar Swap (vital para t3.micro):
   sudo fallocate -l 3G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

2. Actualizar el sistema e instalar dependencias:
   sudo apt update && sudo apt install -y git curl openjdk-17-jdk maven postgresql postgresql-contrib
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   sudo npm install -g pnpm pm2

3. Configurar base de datos PostgreSQL:
   sudo -u postgres psql -c "CREATE USER postgres WITH PASSWORD 'admin369' SUPERUSER;"
   sudo -u postgres psql -c "CREATE DATABASE \"ms1-usuarios\" OWNER postgres;"

4. Clonar el repositorio desde la rama main:
   git clone -b main https://github.com/Dxnxxl369/Aloja-Te.git ~/Aloja-Te

5. Compilar y levantar MS-01 (Spring Boot):
   cd ~/Aloja-Te/backend/ms-usuarios-alojamientos
   cp .env.example .env
   mvn clean package -DskipTests
   pm2 start "java -jar target/ms-usuarios-alojamientos-1.0.0.jar" --name "ms1-usuarios"

6. Configurar y levantar el API Gateway en puerto 8080:
   cd ~/Aloja-Te/backend/gateway-api
   pnpm install
   cp .env.example .env
   # En este momento, puedes iniciar con localhost para MS1 y esperar las IPs de Azure y GCP
   pnpm run build
   pm2 start "pnpm start" --name "gateway-api"
   pm2 save
   pm2 startup

7. Verificar que responda:
   curl http://localhost:8080/health
   curl http://localhost:8080/api/v1/alojamientos
```

---

## ☁️ 3. GUÍA COMPAÑERO 2: MICROSOFT AZURE (Daniel)
**Responsabilidad:** `ms-reservas-estadias` (Puerto 3002) + `bff-admin` (Puerto 4000) + `DynamoDB Local` en Docker (Puerto 8000).

### Paso 1: Crear la Máquina Virtual en Azure Portal
1. Entra a **Azure Portal** $\rightarrow$ **Virtual Machines** $\rightarrow$ **Create** $\rightarrow$ **Azure virtual machine**.
2. **Nombre de la VM:** `alojate-azure-reservas`
3. **Región:** `East US` o la más cercana.
4. **Imagen:** `Ubuntu Server 22.04 LTS - x64 Gen2` o `Ubuntu 24.04 LTS`.
5. **Tamaño (Size):** `Standard_B2s` (2 vCPUs, 4GB RAM) o `Standard_B1ms`.
6. **Tipo de Autenticación:** SSH public key.
   * Nombre de usuario: `azureuser`
   * Descargar clave privada: `alojate-azure-key.pem`.
7. **Networking (Reglas de Entrada / NSG):**
   Ve a **Networking** $\rightarrow$ **Add inbound port rule** y permite (Source: `Any`):
   * `Port 22` (SSH)
   * `Port 80 / 443` (Web)
   * `Port 3002` (TCP) $\rightarrow$ **MS-02 Reservas (NestJS)**
   * `Port 4000` (TCP) $\rightarrow$ **BFF Admin GraphQL (Apollo Server)**
8. **Asignar IP Estática:** En la interfaz de red de la VM $\rightarrow$ **IP Configurations** $\rightarrow$ `ipconfig1` $\rightarrow$ marcar IP como **Static**.
   *(Anota esta IP: ej. `20.120.45.88`)*.

---

### 🤖 PROMPT PARA EL AGENTE DE IA (COMPAÑERO 2 - AZURE)
Copia y pega este texto directamente a tu agente de IA junto con el archivo `alojate-azure-key.pem` y la IP pública de tu VM de Azure:

```markdown
Eres el DevOps Engineer de Aloja-Te en Azure.
Accede por SSH a mi servidor Ubuntu en Azure:
- Host: [PEGA_AQUÍ_LA_IP_DE_AZURE]
- Usuario: azureuser
- Llave SSH: alojate-azure-key.pem

OBJETIVO:
Desplegar DynamoDB Local en Docker, MS-02 (NestJS Reservas en puerto 3002) y BFF-Admin (GraphQL Apollo Server en puerto 4000).

INSTRUCCIONES QUE DEBES EJECUTAR:
1. Actualizar el sistema e instalar Docker, Node.js 20, Git y PM2:
   sudo apt update && sudo apt install -y git curl docker.io docker-compose
   sudo usermod -aG docker $USER
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   sudo npm install -g pnpm pm2

2. Clonar el repositorio desde la rama main:
   git clone -b main https://github.com/Dxnxxl369/Aloja-Te.git ~/Aloja-Te

3. Levantar DynamoDB Local con Docker en puerto 8000:
   cd ~/Aloja-Te/backend/ms-reservas-estadias
   docker run -d --name dynamodb-local -p 8000:8000 -v /data/dynamodb:/home/dynamodblocal/data amazon/dynamodb-local -jar DynamoDBLocal.jar -sharedDb -dbPath /home/dynamodblocal/data
   # (Nota: El microservicio creará la tabla AlojaTe_Reservas automáticamente al conectarse)

4. Configurar y levantar MS-02 (Reservas y Estadías en puerto 3002):
   cd ~/Aloja-Te/backend/ms-reservas-estadias
   pnpm install
   cp .env.example .env
   pnpm run build
   pm2 start "pnpm run start:prod" --name "ms2-reservas"

5. Configurar y levantar BFF-ADMIN (GraphQL en puerto 4000):
   cd ~/Aloja-Te/backend/bff-admin
   pnpm install
   cp .env.example .env
   # Cuando tengas la IP de AWS y GCP, actualízalas en .env
   pnpm run build
   pm2 start "node dist/index.js" --name "bff-admin"
   pm2 save
   pm2 startup

6. Validar con pruebas locales:
   curl http://localhost:3002/api/v1/reservas/health
   curl -X POST http://localhost:4000/ -H "Content-Type: application/json" -d '{"query":"{ metricasGenerales { totalUsuarios totalAlojamientos } }"}'
```

---

## ☁️ 4. GUÍA COMPAÑERO 3: GOOGLE CLOUD PLATFORM (GCP)
**Responsabilidad:** `ms-comercial-financiero` (Puerto 3003).

### Paso 1: Crear la Instancia en Compute Engine
1. Entra a **Google Cloud Console** $\rightarrow$ **Compute Engine** $\rightarrow$ **VM instances** $\rightarrow$ **Create Instance**.
2. **Nombre:** `alojate-gcp-comercial`
3. **Región:** `us-central1` o `southamerica-west1`.
4. **Machine Type:** `e2-micro` o `e2-small` / `e2-medium` (2 vCPU, 4GB RAM).
5. **Boot Disk:** Ubuntu 22.04 LTS x86/64 (20 GB).
6. **Firewall:** Marcar *Allow HTTP traffic* y *Allow HTTPS traffic*.
7. **Reglas de Firewall de VPC (Ports):**
   Ve a **VPC network** $\rightarrow$ **Firewall** $\rightarrow$ **Create Firewall Rule**:
   * **Nombre:** `allow-ms3-laravel`
   * **Targets:** All instances in the network
   * **Source IPv4 ranges:** `0.0.0.0/0`
   * **Protocols and ports:** `tcp:3003`, `tcp:22`, `tcp:80`, `tcp:443`
8. **Asignar IP Externa Estática:** En **VPC network** $\rightarrow$ **External IP addresses** $\rightarrow$ Reservar IP estática para `alojate-gcp-comercial`.
   *(Anota esta IP: ej. `34.125.80.110`)*.

---

### 🤖 PROMPT PARA EL AGENTE DE IA (COMPAÑERO 3 - GCP)
Copia y pega este texto directamente a tu agente de IA junto con el acceso SSH y la IP pública de tu instancia de Google Cloud:

```markdown
Eres el DevOps Engineer de Aloja-Te en Google Cloud.
Accede por SSH a mi servidor Ubuntu en Compute Engine:
- Host: [PEGA_AQUÍ_LA_IP_ESTATICA_DE_GCP]
- Usuario: [TU_USUARIO_GCP]

OBJETIVO:
Desplegar PostgreSQL y el microservicio MS-03 (Comercial y Financiero en Laravel 10 / PHP 8.2 en puerto 3003).

INSTRUCCIONES QUE DEBES EJECUTAR:
1. Instalar PHP 8.2, extensiones requeridas, Composer y PostgreSQL:
   sudo apt update
   sudo apt install -y software-properties-common curl git
   sudo add-apt-repository ppa:ondrej/php -y
   sudo apt update
   sudo apt install -y php8.2 php8.2-cli php8.2-common php8.2-pgsql php8.2-mbstring php8.2-xml php8.2-curl php8.2-zip unzip postgresql postgresql-contrib

2. Instalar Composer y PM2:
   curl -sS https://getcomposer.org/installer | php
   sudo mv composer.phar /usr/local/bin/composer
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   sudo npm install -g pm2

3. Configurar PostgreSQL para MS-03:
   sudo -u postgres psql -c "CREATE USER postgres WITH PASSWORD 'admin369' SUPERUSER;"
   sudo -u postgres psql -c "CREATE DATABASE \"ms3-pagos_comercios\" OWNER postgres;"

4. Clonar el repositorio desde la rama main:
   git clone -b main https://github.com/Dxnxxl369/Aloja-Te.git ~/Aloja-Te
   cd ~/Aloja-Te/backend/ms-comercial-financiero
   composer install --no-dev --optimize-autoloader
   cp .env.example .env

5. Configurar archivo .env de Laravel:
   php artisan key:generate --force
   # Si existen migraciones:
   php artisan migrate --force

6. Levantar con PM2 en el puerto 3003:
   pm2 start "php -S 0.0.0.0:3003 -t public" --name "ms3-comercial"
   pm2 save
   pm2 startup

7. Validar salud del microservicio:
   curl http://localhost:3003/api/v1/finanzas/health
```

---

## 🔄 5. EL PASO FINAL DE INTEGRACIÓN: ENLAZAR LAS 3 NUBES

Una vez que cada compañero haya levantado su microservicio y confirmado que responde localmente, se intercambian las 3 IPs:

### Matriz de Enlaces entre Compañeros:

| Microservicio | Nube | Responsable | Variable a entregar |
|---|---|---|---|
| **API Gateway** | AWS | Compañero 1 | `GATEWAY_URL = http://IP_AWS:8080` |
| **MS-01 Usuarios** | AWS | Compañero 1 | `MS_USUARIOS_URL = http://localhost:3001` (Interno en AWS) |
| **MS-02 Reservas** | Azure | Daniel (Compañero 2) | `MS_RESERVAS_URL = http://IP_AZURE:3002` |
| **BFF-Admin GraphQL** | Azure | Daniel (Compañero 2) | `BFF_GRAPHQL_URL = http://IP_AZURE:4000/` |
| **MS-03 Comercial** | GCP | Compañero 3 | `MS_COMERCIAL_URL = http://IP_GCP:3003` |

### Actualización en el API Gateway (Compañero 1 en AWS):
Edita su archivo `backend/gateway-api/.env`:
```env
PORT=8080
MS_USUARIOS_URL=http://localhost:3001
MS_RESERVAS_URL=http://[IP_AZURE_DANIEL]:3002
MS_COMERCIAL_URL=http://[IP_GCP_COMPANERO_3]:3003
```
Y reinicia:
```bash
pm2 restart gateway-api
```

### Actualización en BFF-Admin GraphQL (Compañero 2 en Azure):
Edita su archivo `backend/bff-admin/.env`:
```env
PORT=4000
GATEWAY_URL=http://[IP_AWS_COMPANERO_1]:8080
MS_USUARIOS_URL=http://[IP_AWS_COMPANERO_1]:8080/api/v1/usuarios
MS_RESERVAS_URL=http://localhost:3002
MS_FINANZAS_URL=http://[IP_GCP_COMPANERO_3]:3003
```
Y reinicia:
```bash
pm2 restart bff-admin
```

---

## 📱 6. CONECTAR LOS FRONTENDS Y LA APP MÓVIL

Una vez el API Gateway esté corriendo en AWS con su IP pública (ej. `http://54.210.15.20:8080`):

### 1. Despliegue de los Portales Web en Vercel
En Vercel se pueden importar como proyectos separados desde la rama `main`:
1. **Portal Clientes (`frontend/portal-clientes`)**:
   - Root Directory: `frontend/portal-clientes`
   - Framework Preset: `Vite`
   - Variable de Entorno:
     - `VITE_API_GATEWAY_URL` = `http://IP_PUBLICA_AWS:8080`
2. **Portal Anfitrión (`frontend/portal-anfitrion`)**:
   - Root Directory: `frontend/portal-anfitrion`
   - Framework Preset: `Vite`
   - Variable de Entorno:
     - `VITE_API_GATEWAY_URL` = `http://IP_PUBLICA_AWS:8080`
3. **Portal Administrador (`frontend/portal-admin`)**:
   - Root Directory: `frontend/portal-admin`
   - Framework Preset: `Angular` (Build command: `ng build`, Output directory: `dist/portal-admin`)
   - Variable de Entorno:
     - `VITE_API_GATEWAY_URL` = `http://IP_PUBLICA_AWS:8080`
     - `VITE_BFF_GRAPHQL_URL` = `http://IP_PUBLICA_AZURE:4000/`

### 2. App Móvil (React Native con Expo)
En `frontend/app-movil/.env`:
```env
EXPO_PUBLIC_API_URL=http://IP_PUBLICA_AWS:8080
```
Para generar el APK ejecutan:
```bash
npx eas build -p android --profile preview
```

---

## 🧪 7. COMANDOS DE DIAGNÓSTICO RÁPIDO PARA EL DOCENTE

Desde la terminal de cualquiera del equipo o la máquina de evaluación, ejecuten este script en PowerShell:

```powershell
$GW = "http://IP_PUBLICA_AWS:8080"
$BFF = "http://IP_PUBLICA_AZURE:4000"

Write-Host "1. Verificando API Gateway en AWS..." -ForegroundColor Cyan
Invoke-RestMethod -Uri "$GW/health" -Method Get

Write-Host "2. Consultando MS-01 (Usuarios en AWS) vía Gateway..." -ForegroundColor Cyan
(Invoke-RestMethod -Uri "$GW/api/v1/alojamientos" -Method Get).Count

Write-Host "3. Consultando MS-02 (Reservas en Azure) vía Gateway..." -ForegroundColor Cyan
Invoke-RestMethod -Uri "$GW/api/v1/reservas/health" -Method Get

Write-Host "4. Consultando MS-03 (Comercial en GCP) vía Gateway..." -ForegroundColor Cyan
Invoke-RestMethod -Uri "$GW/api/v1/finanzas/health" -Method Get

Write-Host "5. Consultando BFF Admin GraphQL en Azure..." -ForegroundColor Cyan
Invoke-RestMethod -Uri "$BFF" -Method Post -ContentType "application/json" -Body '{"query":"{ metricasGenerales { totalUsuarios totalAlojamientos } }"}'
```
