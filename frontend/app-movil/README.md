# Aloja-Te · App móvil

App React Native (Expo SDK 58) offline-first para buscar alojamientos en Bolivia, reservar (a mano o con un agente) y pagar con QR Simple.

## Requisitos

| Herramienta | Para qué |
|---|---|
| Node.js 22.13+ (o 24.3+) y pnpm | Ejecutar Expo e instalar dependencias (`pnpm-lock.yaml`) |
| **Expo Go** (SDK 58) en el celular, o Android Studio con un emulador | Ver la app |
| Android Studio + JDK | Solo para un *development build* (IA local) |

## Puesta en marcha

1. **Dependencias**, desde `frontend/app-movil`: `pnpm install`.
   No borres `pnpm-workspace.yaml` (fija `nodeLinker: hoisted`; sin él Metro no encuentra dependencias). El aviso "Ignored build scripts: llama.rn" es normal.
2. **Backend**: la app habla con el Gateway (:8080). Desde la raíz del repositorio, `./iniciar-todo.bat` (para detener: `./detener-todo.bat`).
3. **Variables** (opcional): `cp .env.example .env`. Se leen al iniciar Metro; si las cambias, `pnpm start --clear`.
4. **Ejecutar**: `pnpm start`, y en esa terminal `a` (emulador Android), `i` (simulador iOS, macOS) o escanea el QR con Expo Go.

| Variable | Por defecto | Para qué |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | `http://10.0.2.2:8080` | URL del Gateway |
| `EXPO_PUBLIC_PAGO_SIMULADO` | desactivado | `1` muestra "Simular pago del banco (demo)" |
| `EXPO_PUBLIC_IA_LOCAL` | `true` | `false` desactiva la IA local |

| Dónde corre la app | `EXPO_PUBLIC_API_URL` |
|---|---|
| Emulador de Android | `http://10.0.2.2:8080` (no hace falta `.env`) |
| Celular físico (misma Wi-Fi que la PC) | `http://<IP-de-tu-PC>:8080` (la ves con `ipconfig`) |
| Simulador de iOS / web | `http://localhost:8080` |

## Comandos útiles

| Comando | Qué hace |
|---|---|
| `pnpm start --clear` | Inicia Metro sin caché (tras cambiar `.env` o si algo se ve raro) |
| `pnpm start --tunnel` | Túnel, si el celular no ve tu PC en la red |
| `npx tsc --noEmit` | Revisa los tipos de TypeScript |
| `pnpm exec expo export --platform android` | Empaqueta la app para comprobar que compila |

## Qué hace la app

Tres pestañas (**Explorar**, **Agente** al centro, **Perfil**) y, encima, las demás pantallas.

| Pantalla | Para qué |
|---|---|
| Inicio de sesión | Correo y contraseña (cuenta del seed de MS-01, ej. `cliente@alojate.bo`) |
| Explorar | Buscador con filtros (ciudad, precio, huéspedes), destacados y lista de alojamientos |
| Ficha del alojamiento | Fotos, ubicación con "Ver mapa", capacidad y horarios, servicios y políticas; reservar |
| Agente | Chat que arma la reserva, con el avance en 4 etapas (Pedido, Opciones, Confirmar, Pagar) |
| Reservar a mano | Elegir habitación y fechas, sin pasar por el agente |
| Perfil | Tu cuenta, **Mis reservas** y **Agente inteligente** |
| Reserva | Cuenta regresiva de 15 min, estado y, al confirmarse, el PIN de check-in |
| Pago | QR Simple: pendiente, aprobado, fallido y vencido |

**Avisos:** la app programa notificaciones **locales** (5 minutos antes de que venza el pago y la víspera del check-in). Las push de servidor no existen en Expo Go de Android; hacen falta un development build y un servicio que las envíe.

## IA local (opcional)

En **Perfil → Agente inteligente** (o con el icono de descarga del agente) se descarga la IA del celular (~528 MB, mejor con Wi-Fi; pide 4 GB de memoria). Sin ella, el agente entiende frases simples y sigue funcionando.
Descargarla funciona en Expo Go, pero **activarla** exige un development build (varios minutos la primera vez): `pnpm exec expo run:android`.

## Cómo está organizado el código

```
App.tsx                  arranque: fuentes, core, login o app
src/app/                 la composición: navegacion.tsx (solo arma), Pestanas, Marco, routeTypes,
                         features.ts (contexto) y routes/ (una ruta por archivo: conectan pantalla, feature y navegación)
src/core/                infraestructura: http, auth, base de datos, cola offline, IA local, notificaciones
src/shared/              lo que usan varios features: ui/ (componentes, tema.ts, texts.ts, plural, dinero, tiempo) y rutas.ts
src/features/<feature>/  agente · catalogo · cuenta · ia · pagos · reservas
  constantes.ts          números y rutas del negocio
  domain/ data/          reglas y acceso al servidor (sin React)
  presentacion/          pantallas/ · componentes/ · hooks · texts.ts
```

Reglas del proyecto:
- Las pantallas y los componentes no llevan constantes: los estilos van en `<Archivo>.styles.ts`, los textos en `texts.ts` y los números en `constantes.ts`.
- Los features no se importan entre sí; se conectan en `src/app/`. Lo compartido va en `src/shared/`, no en `core`, para probar la lógica sin el celular.
- Los colores salen de `tema.ts`. Código nuevo: nombres en inglés; lo que ve el usuario, en español simple.

## Solución de problemas

| Síntoma | Qué hacer |
|---|---|
| "No hay conexión con el servidor" al iniciar sesión | Revisa que `iniciar-todo.bat` esté corriendo y que `EXPO_PUBLIC_API_URL` sea la de tu dispositivo |
| En celular físico no conecta | Misma red que la PC; permite el puerto 8080 en el firewall de Windows |
| `Unable to resolve module ...` | Borra `node_modules` y `pnpm install` (necesita `pnpm-workspace.yaml`); si es un paquete recién instalado, `pnpm start --clear` |
| `TypeError: fetch failed` al iniciar | Expo no pudo consultar su API (sin internet, VPN o proxy): `pnpm start --offline` |
| Expo Go dice "incompatible SDK" | Instala la versión de Expo Go para SDK 58 |
| No aparece "Simular pago del banco" | `EXPO_PUBLIC_PAGO_SIMULADO=1` en `.env` y `pnpm start --clear` |
| Avisos amarillos de `expo-notifications` en Expo Go | Son informativos; las notificaciones locales funcionan |
| Errores rojos justo después de editar archivos | Recarga en caliente a medias: cierra Expo Go y ábrelo de nuevo |

## Notas de los servicios (reserva y pago)

- **MS-03** valida la reserva en MS-02 antes de cobrar (`GATEWAY_URL`; `VALIDAR_RESERVA_ANTES_DE_COBRAR=false` lo apaga) y reintenta si RabbitMQ falla.
- **MS-02** escucha `finanzas.pago.confirmado` y confirma la reserva; si ya no se puede honrar, pide el reembolso. Sin pagar a tiempo pasa a `EXPIRADA` y libera las fechas.
- Si `alojate-dynamodb` falla con `unable to open database file`, MS-02 espera a DynamoDB; para probar sin él: `DYNAMODB_ENDPOINT=http://127.0.0.1:9` (usa memoria).
