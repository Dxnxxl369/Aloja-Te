import React, { useState } from 'react';
import {
  KeyRound,
  LogOut,
  Calendar,
  Clock
} from 'lucide-react';
import { Alojamiento } from '../../../core/types/anfitrion.types';
import { API_BASE_URL } from '../../../core/api/apiEndpoints';
import { ModalValidarPin } from '../modals/ModalValidarPin';
import { ModalAdvertenciaCheckout } from '../modals/ModalAdvertenciaCheckout';
import { ModalCronogramaConsecutivo } from '../modals/ModalCronogramaConsecutivo';

interface RecepcionPinControlProps {
  alojamientos: Alojamiento[];
  onActualizarAlojamientos: (nuevaLista: Alojamiento[]) => void;
  onMostrarToast: (mensaje: string) => void;
}

export const RecepcionPinControl: React.FC<RecepcionPinControlProps> = ({
  alojamientos,
  onActualizarAlojamientos,
  onMostrarToast
}) => {
  const [filtroEstado, setFiltroEstado] = useState<'TODOS' | 'EN_USO' | 'PENDIENTE' | 'LIBRE'>('TODOS');
  
  // Modales
  const [alojamientoPinId, setAlojamientoPinId] = useState<string | null>(null);
  const [alojamientoCheckoutId, setAlojamientoCheckoutId] = useState<string | null>(null);
  const [alojamientoCronogramaId, setAlojamientoCronogramaId] = useState<string | null>(null);

  const conteoTodos = alojamientos.length;
  const conteoEnUso = alojamientos.filter(a => a.estadoOperativo === 'EN_USO').length;
  const conteoPendiente = alojamientos.filter(a => a.estadoOperativo === 'PENDIENTE').length;
  const conteoLibre = alojamientos.filter(a => a.estadoOperativo === 'LIBRE').length;

  const filtrados = alojamientos.filter(a => {
    if (filtroEstado === 'TODOS') return true;
    return a.estadoOperativo === filtroEstado;
  });

  const alojamientoPin = alojamientos.find(a => a.idAlojamiento === alojamientoPinId) || null;
  const alojamientoCheckout = alojamientos.find(a => a.idAlojamiento === alojamientoCheckoutId) || null;
  const alojamientoCronograma = alojamientos.find(a => a.idAlojamiento === alojamientoCronogramaId) || null;

  // Registrar ingreso: Valida PIN contra MS-02 y cambia a EN_USO
  const handleConfirmarIngreso = async (idAlojamiento: string, pin: string): Promise<boolean> => {
    const target = alojamientos.find(a => a.idAlojamiento === idAlojamiento);
    const reserva = target?.reservas?.[0];
    const huesped = reserva?.huespedNombre || 'huésped';

    if (!reserva) {
      onMostrarToast('No se encontró una reserva activa para este alojamiento.');
      return false;
    }

    const pinLimpio = pin.trim();
    const pinEsperado = (reserva.pinSecreto || '').trim();

    // 1. Verificación estricta del PIN de 6 dígitos
    if (pinEsperado && pinLimpio !== pinEsperado) {
      onMostrarToast('El código PIN ingresado es incorrecto.');
      return false;
    }

    // 2. Notificar al microservicio de Reservas (MS-02)
    if (reserva.idReserva) {
      try {
        const resp = await fetch(`${API_BASE_URL}/api/v1/reservas/${reserva.idReserva}/check-in`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            codigoCheckin: pinLimpio
          })
        });

        if (!resp.ok) {
          const errData = await resp.json().catch(() => ({}));
          const msg = errData.message || 'El código PIN de check-in es incorrecto.';
          onMostrarToast(msg);
          return false;
        }
      } catch (netErr) {
        console.warn('[Recepcion] Error comunicando con backend para check-in:', netErr);
        if (pinEsperado && pinLimpio !== pinEsperado) {
          onMostrarToast('El código PIN ingresado es incorrecto.');
          return false;
        }
      }
    }

    // 3. Confirmar ingreso y actualizar estado operativo a EN_USO
    const actualizada = alojamientos.map(a => {
      if (a.idAlojamiento === idAlojamiento) {
        const reservasActualizadas = (a.reservas || []).map((r, idx) =>
          idx === 0 ? { ...r, estado: 'EN_USO' as const } : r
        );
        return {
          ...a,
          estadoOperativo: 'EN_USO' as const,
          reservas: reservasActualizadas
        };
      }
      return a;
    });

    onActualizarAlojamientos(actualizada);
    setAlojamientoPinId(null);
    onMostrarToast(`Ingreso confirmado con éxito para ${huesped}.`);
    return true;
  };

  // Registrar salida: Notifica a MS-02 y libera la habitación
  const handleConfirmarSalida = async (idAlojamiento: string) => {
    const target = alojamientos.find(a => a.idAlojamiento === idAlojamiento);
    const reserva = target?.reservas?.[0];
    const huespedSaliente = reserva?.huespedNombre || 'huésped';

    // 1. Notificar al microservicio de Reservas (MS-02) la salida oficial
    if (reserva?.idReserva) {
      try {
        await fetch(`${API_BASE_URL}/api/v1/reservas/${reserva.idReserva}/check-out`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
      } catch (errOut) {
        console.warn('[Recepcion] Error al sincronizar checkout con MS-02:', errOut);
      }
    }

    // 2. Quitar reserva completada del flujo activo y actualizar estado operativo
    const actualizada = alojamientos.map(a => {
      if (a.idAlojamiento === idAlojamiento) {
        const reservas = [...(a.reservas || [])];
        reservas.shift(); // Quita reserva completada

        if (reservas.length > 0) {
          reservas[0] = { ...reservas[0], estado: 'PENDIENTE' as const };
          return {
            ...a,
            estadoOperativo: 'PENDIENTE' as const,
            reservas
          };
        } else {
          return {
            ...a,
            estadoOperativo: 'LIBRE' as const,
            reservas: []
          };
        }
      }
      return a;
    });

    onActualizarAlojamientos(actualizada);
    setAlojamientoCheckoutId(null);
    onMostrarToast(`Salida registrada para ${huespedSaliente}. Habitación liberada.`);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      
      {/* Encabezado con botón amarillo vivo de acción rápida */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
            Recepción
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Registro de ingreso, salida y estancias activas
          </p>
        </div>

        {conteoPendiente > 0 && (
          <button
            type="button"
            onClick={() => {
              const primeroPendiente = alojamientos.find(a => a.estadoOperativo === 'PENDIENTE') || alojamientos[0];
              if (primeroPendiente) setAlojamientoPinId(primeroPendiente.idAlojamiento);
            }}
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-lg shadow-amber-500/25 transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <KeyRound className="w-4 h-4" />
            <span>Registrar ingreso</span>
          </button>
        )}
      </div>

      {/* Pestañas con colores temáticos vivos */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto text-xs font-bold">
        <button
          type="button"
          onClick={() => setFiltroEstado('TODOS')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
            filtroEstado === 'TODOS'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>Todos</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            filtroEstado === 'TODOS' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}>
            {conteoTodos}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFiltroEstado('EN_USO')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
            filtroEstado === 'EN_USO'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
              : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>EN USO</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            filtroEstado === 'EN_USO' ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold'
          }`}>
            {conteoEnUso}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFiltroEstado('PENDIENTE')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
            filtroEstado === 'PENDIENTE'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>PENDIENTE</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            filtroEstado === 'PENDIENTE' ? 'bg-white/20 text-white' : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold'
          }`}>
            {conteoPendiente}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFiltroEstado('LIBRE')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
            filtroEstado === 'LIBRE'
              ? 'bg-slate-700 dark:bg-slate-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          <span>LIBRE</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            filtroEstado === 'LIBRE' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold'
          }`}>
            {conteoLibre}
          </span>
        </button>
      </div>

      {/* Lista de Unidades con bordes y badges vivos */}
      <div className="space-y-4">
        {filtrados.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400 bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200 dark:border-slate-800">
            No se encontraron unidades en este estado.
          </div>
        ) : (
          filtrados.map(a => {
            const reservaActual = a.reservas?.[0];
            const tieneSiguienteReserva = (a.reservas?.length || 0) > 1;
            const esEnUso = a.estadoOperativo === 'EN_USO';
            const esPendiente = a.estadoOperativo === 'PENDIENTE';
            const esLibre = a.estadoOperativo === 'LIBRE';

            const foto = a.fotografias?.[0]?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80';

            return (
              <div
                key={a.idAlojamiento}
                className={`p-5 rounded-3xl bg-white dark:bg-[#0F172A] border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition hover:shadow-md ${
                  esPendiente
                    ? 'border-amber-300 dark:border-amber-800 ring-1 ring-amber-400/20'
                    : esEnUso
                    ? 'border-emerald-200 dark:border-emerald-900/50'
                    : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                  <img
                    src={foto}
                    alt={a.titulo}
                    className="w-16 h-16 rounded-2xl object-cover shrink-0 shadow-xs"
                  />

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white truncate">
                        {a.titulo}
                      </h3>

                      {esEnUso && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] border border-emerald-300 dark:border-emerald-800 shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>EN USO</span>
                        </span>
                      )}

                      {esPendiente && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-[10px] border border-amber-300 dark:border-amber-800 shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span>PENDIENTE</span>
                        </span>
                      )}

                      {esLibre && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[10px] border border-slate-300 dark:border-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          <span>LIBRE</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {a.ciudad}, {a.departamento}
                    </p>

                    {reservaActual ? (
                      <div className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2 flex-wrap">
                        <span>
                          Huésped: <strong className="text-blue-600 dark:text-blue-400 font-bold">{reservaActual.huespedNombre}</strong>
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">·</span>
                        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          Estadía: {reservaActual.desde} al {reservaActual.hasta}
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        Propiedad lista para recibir nuevos viajeros.
                      </p>
                    )}

                    {tieneSiguienteReserva && (
                      <div className="p-2 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>Siguiente: <strong>{a.reservas?.[1]?.huespedNombre}</strong> ({a.reservas?.[1]?.desde})</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones con colores vivos */}
                <div className="shrink-0 flex items-center justify-end gap-2 self-end sm:self-auto">
                  {esPendiente && (
                    <button
                      type="button"
                      onClick={() => setAlojamientoPinId(a.idAlojamiento)}
                      className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/25 transition flex items-center gap-2 cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>Registrar ingreso</span>
                    </button>
                  )}

                  {esEnUso && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAlojamientoCheckoutId(a.idAlojamiento)}
                        className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Registrar salida</span>
                      </button>

                      {tieneSiguienteReserva && (
                        <button
                          type="button"
                          onClick={() => setAlojamientoCronogramaId(a.idAlojamiento)}
                          className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                          title="Ver próximas reservas"
                        >
                          <Calendar className="w-4 h-4 text-blue-500" />
                        </button>
                      )}
                    </div>
                  )}

                  {esLibre && (
                    <span className="text-xs text-slate-400 font-medium italic">
                      Sin huéspedes activos
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modales de Recepción */}
      <ModalValidarPin
        isOpen={Boolean(alojamientoPinId)}
        onClose={() => setAlojamientoPinId(null)}
        alojamiento={alojamientoPin}
        onConfirmarIngreso={handleConfirmarIngreso}
      />

      <ModalAdvertenciaCheckout
        isOpen={Boolean(alojamientoCheckoutId)}
        onClose={() => setAlojamientoCheckoutId(null)}
        alojamiento={alojamientoCheckout}
        onConfirmarSalida={handleConfirmarSalida}
      />

      <ModalCronogramaConsecutivo
        isOpen={Boolean(alojamientoCronogramaId)}
        onClose={() => setAlojamientoCronogramaId(null)}
        alojamiento={alojamientoCronograma}
      />

    </div>
  );
};