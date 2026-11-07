// ======================================================================
// ARCHIVO: reservas/data/repositorio.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: La implementación real de RepositorioReservas: habla con MS-02 y se apoya en la caché y la cola offline de core.
// PARA QUÉ SIRVE: Crear la reserva con red; si no hay red, dejarla en cola con la MISMA clave de idempotencia y enviarla después.
// SIN ÉL: Los casos no tendrían de dónde sacar ni dónde guardar reservas.
// NO VA AQUÍ: Reglas de negocio (domain/casos.ts).
// ======================================================================
// OJO (contrato con MS-02): la clave de idempotencia va en el CUERPO (idempotencyKey).
// Hoy MS-02 la guarda pero NO la usa para evitar duplicados: si la respuesta se pierde
// y el reintento llega, se crearía una segunda reserva. Hay que pedir al equipo de MS-02
// que busque por idempotencyKey antes de crear.

import type { Api, Cola } from '../../../core';
import { esSinRed } from '../../../core';
import { CACHE, RUTA_RESERVAS, TIPO_OP_CREAR_RESERVA } from '../constantes';
import type { RepositorioReservas } from '../domain/interfaces';
import { disponibilidadDesdeDto, dtoDesdeSolicitud, reservaDesdeDto } from './mapeadores';
import type { CrearReservaDto, DisponibilidadDto, ReservaDto } from './modelos';

export interface DepsRepositorioReservas {
  api: Api;
  cola: Cola;
  nuevoId: () => string;
  /** Las funciones de caché de core, inyectadas para poder probar sin SQLite. */
  guardarCache: (clave: string, valor: unknown, ttlMs?: number) => Promise<void>;
  leerCache: <T>(clave: string) => Promise<T | null>;
}

export function crearRepositorioReservas(deps: DepsRepositorioReservas): RepositorioReservas & {
  /** Registrar al arrancar: cómo se envía una reserva que estaba en la cola. */
  registrarManejadores(): void;
} {
  const { api, cola, nuevoId, guardarCache, leerCache } = deps;

  async function recordar(dto: ReservaDto, idempotencyKey: string): Promise<void> {
    await guardarCache(CACHE.PREFIJO_RESERVA + dto.idReserva, dto, CACHE.TTL_MS);
    await guardarCache(CACHE.PREFIJO_CLAVE + idempotencyKey, dto.idReserva, CACHE.TTL_MS);
  }

  return {
    async crear(solicitud) {
      const idempotencyKey = nuevoId();
      const dto = dtoDesdeSolicitud(solicitud, idempotencyKey);
      try {
        const resp = await api.post<ReservaDto>(RUTA_RESERVAS, dto, { idempotencyKey });
        await recordar(resp, idempotencyKey);
        return { tipo: 'CREADA', reserva: reservaDesdeDto(resp) };
      } catch (e) {
        if (!esSinRed(e)) throw e;
        await cola.encolar(TIPO_OP_CREAR_RESERVA, dto); // el dto lleva la misma clave
        return { tipo: 'EN_COLA', idempotencyKey };
      }
    },

    async obtener(id) {
      try {
        const resp = await api.get<ReservaDto>(`${RUTA_RESERVAS}/${id}`);
        await guardarCache(CACHE.PREFIJO_RESERVA + id, resp, CACHE.TTL_MS);
        return reservaDesdeDto(resp);
      } catch (e) {
        if (!esSinRed(e)) throw e;
        const guardada = await leerCache<ReservaDto>(CACHE.PREFIJO_RESERVA + id);
        if (!guardada) throw e;
        return reservaDesdeDto(guardada);
      }
    },

    async obtenerPorClave(idempotencyKey) {
      const id = await leerCache<string>(CACHE.PREFIJO_CLAVE + idempotencyKey);
      if (!id) return null;
      const dto = await leerCache<ReservaDto>(CACHE.PREFIJO_RESERVA + id);
      return dto ? reservaDesdeDto(dto) : null;
    },

    async disponibilidad(unidadId, checkIn, checkOut) {
      const resp = await api.get<DisponibilidadDto>(`${RUTA_RESERVAS}/disponibilidad/${unidadId}`, {
        query: { checkIn, checkOut },
      });
      return disponibilidadDesdeDto(resp);
    },

    registrarManejadores() {
      cola.registrarManejador(TIPO_OP_CREAR_RESERVA, async (dto: CrearReservaDto) => {
        const resp = await api.post<ReservaDto>(RUTA_RESERVAS, dto, { idempotencyKey: dto.idempotencyKey });
        await recordar(resp, dto.idempotencyKey);
      });
    },
  };
}
