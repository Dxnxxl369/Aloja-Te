# Aloja-Te · App móvil

App React Native (Expo SDK 58) offline-first. Flujo: **Login → Agente (arma la reserva) → Reserva con cuenta regresiva → Pago con QR Simple**.

## Requisitos

| Herramienta | Para qué |
|---|---|
| Node.js 22.13+ (o 24.3+) | Ejecutar Expo |
| pnpm | Instalar dependencias (el proyecto usa `pnpm-lock.yaml`) |
| App **Expo Go** (SDK 58) en el celular, **o** Android Studio con un emulador | Ver la app |
| Android Studio + JDK | Solo si haces un *development build* (ver más abajo) |

## 1. Instalar dependencias

Desde `frontend/app-movil`:

```bash
pnpm install
```

> `pnpm-workspace.yaml` fija `nodeLinker: hoisted`. No lo borres: sin él Metro no encuentra algunas dependencias.
> Si pnpm avisa "Ignored build scripts: llama.rn", es normal; no hace falta aprobarlo.

## 2. Levantar el backend

La app habla con el Gateway en el puerto **8080**. Desde la raíz del repositorio:

```bash
./iniciar-todo.bat
```

Levanta los microservicios (MS-01 :3001, MS-02 :3002, MS-03 :3003, MS-04 :3004) y el Gateway (:8080). Para detenerlos: `./detener-todo.bat`.

## 3. Configurar variables (opcional)

```bash
cp .env.example .env
```

| Variable | Valor por defecto | Para qué |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | `http://10.0.2.2:8080` | URL del Gateway |
| `EXPO_PUBLIC_PAGO_SIMULADO` | desactivado | `1` muestra el botón "Simular pago del banco (demo)" |
| `EXPO_PUBLIC_IA_LOCAL` | `true` | `false` desactiva la IA local |

Qué URL poner según dónde corre la app:

| Dónde corre | `EXPO_PUBLIC_API_URL` |
|---|---|
| Emulador de Android | `http://10.0.2.2:8080` (por defecto, no hace falta `.env`) |
| Celular físico (misma red Wi-Fi que la PC) | `http://<IP-de-tu-PC>:8080`, ej. `http://192.168.1.20:8080` |
| Simulador de iOS / web | `http://localhost:8080` |

Para ver tu IP en Windows: `ipconfig` (campo "Dirección IPv4").
Las variables se leen al iniciar Metro: si cambias el `.env`, reinicia con `pnpm start --clear`.

## 4. Ejecutar la app

```bash
pnpm start
```

Abre el servidor de desarrollo (Metro). Desde esa terminal:

- **`a`** abre en el emulador de Android.
- **`i`** abre en el simulador de iOS (solo macOS).
- **Celular físico:** escanea el QR con Expo Go (Android) o con la cámara (iOS).

Atajos directos:

```bash
pnpm android     # inicia y abre en el emulador de Android
pnpm ios         # inicia y abre en el simulador de iOS (macOS)
pnpm web         # inicia en el navegador
```

## Comandos útiles

| Comando | Qué hace |
|---|---|
| `pnpm start` | Inicia Metro |
| `pnpm start --clear` | Inicia Metro limpiando la caché (úsalo tras cambiar `.env` o si algo se ve raro) |
| `pnpm start --tunnel` | Expone la app por túnel (si el celular no ve tu PC en la red) |
| `pnpm typecheck` | Revisa los tipos de TypeScript (`tsc --noEmit`) |
| `pnpm exec expo export --platform android` | Empaqueta la app para comprobar que compila |

## IA local (opcional): development build

El modelo local (Qwen3.5-0.8B con `llama.rn`) usa código nativo y **no corre en Expo Go**. En Expo Go la app funciona igual: el agente usa la nube (MS-04) o sus reglas internas.

Para probar la IA local, genera un development build (requiere Android Studio, emulador o celular con depuración USB):

```bash
pnpm exec expo run:android
```

Notas:
- La primera compilación tarda varios minutos.
- La app aún no tiene pantalla para descargar el modelo; sin el archivo descargado, la IA local no se activa.
- El modelo exige un celular con 4 GB de RAM o más.

## Solución de problemas

| Síntoma | Qué hacer |
|---|---|
| "No hay conexión con el servidor" al iniciar sesión | Revisa que `iniciar-todo.bat` esté corriendo y que `EXPO_PUBLIC_API_URL` sea correcta para tu dispositivo (tabla de arriba) |
| En celular físico no conecta | PC y celular deben estar en la misma red; permite el puerto 8080 en el firewall de Windows |
| `Unable to resolve module @babel/runtime...` | Borra `node_modules` y ejecuta `pnpm install` de nuevo (necesita `pnpm-workspace.yaml`) |
| `TypeError: fetch failed` al hacer `pnpm start` (pasa en `getNativeModuleVersionsAsync`) | Expo no pudo consultar su API para validar versiones (sin internet, DNS, VPN o proxy). Revisa la conexión o inicia sin red: `pnpm start --offline` |
| Cambié el `.env` y no se nota | `pnpm start --clear` |
| Expo Go dice "incompatible SDK" | Instala la versión de Expo Go compatible con SDK 58 |
| No aparece el botón "Simular pago del banco" | Pon `EXPO_PUBLIC_PAGO_SIMULADO=1` en `.env` y reinicia con `--clear` |

## Qué hace la app

| Pantalla | Para qué |
|---|---|
| Inicio de sesión | Entrar con correo y contraseña (cuenta del seed de MS-01, ej. `cliente@alojate.bo`) |
| Agente | Chat que arma la reserva: tarjetas con foto, servicios y calificación, recomendación y respuestas rápidas |
| Mis reservas | Lista de reservas del usuario (funciona sin red con lo último guardado) |
| Reserva | Cuenta regresiva de 15 min, estado y, al confirmarse, el PIN de check-in para recepción |
| Pago | QR Simple con estados: pendiente, aprobado, rechazado y vencido |
| IA local | Descargar, activar o borrar el modelo (se toca el indicador "modo básico" del agente) |

La IA local se descarga en Expo Go, pero **activarla** exige un development build (`pnpm exec expo run:android`).

## Cambios en los servicios (Saga de reserva y pago)

- **MS-03** valida la reserva en MS-02 (por el Gateway) antes de cobrar y cobra el importe del servidor. Variables: `GATEWAY_URL` (por defecto `http://localhost:8080`) y `VALIDAR_RESERVA_ANTES_DE_COBRAR=false` para apagarlo.
- **MS-03** ya no marca un evento como publicado si RabbitMQ falló: se reintenta en la siguiente petición.
- **MS-02** escucha `finanzas.pago.confirmado` (cola `ms-reservas.pagos`) y confirma la reserva. Si ya no se puede honrar, pide el reembolso a MS-03 por el Gateway. Una reserva sin pagar a tiempo pasa a `EXPIRADA` y libera las fechas.
- **MS-01**: la búsqueda de alojamientos ya no falla con filtros vacíos (`lower(bytea)`).

Aviso: si el contenedor `alojate-dynamodb` falla con `unable to open database file`, MS-02 se queda esperando a DynamoDB al arrancar. Para probar sin DynamoDB: `DYNAMODB_ENDPOINT=http://127.0.0.1:9` (usa memoria).
