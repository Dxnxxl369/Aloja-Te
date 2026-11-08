import React, { useState } from 'react';
import {
  KeyRound,
  CheckCircle,
  LogOut,
  Calendar,
  Clock,
  Home,
  Hotel
} from 'lucide-react';
import { Alojamiento } from '../../../core/types/anfitrion.types';
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
  const [filtroEstado, setFiltroEstado] = useState<'TODOS' | 'PENDIENTE' | 'EN_USO' | 'LIBRE'>('TODOS');
  
  // Modales
  const [alojamientoPinId, setAlojamientoPinId] = useState<string | null>(null);
  const [alojamientoCheckoutId, setAlojamientoCheckoutId] = useState<string | null>(null);
  const [alojamientoCronogramaId, setAlojamientoCronogramaId] = useState<string | null>(null);

  const conteoTodos = alojamientos.length;
  const conteoPendiente = alojamientos.filter(a => a.estadoOperativo === 'PENDIENTE').length;
  const conteoEnUso = alojamientos.filter(a => a.estadoOperativo === 'EN_USO').length;
  const conteoLibre = alojamientos.filter(a => a.estadoOperativo === 'LIBRE').length;

  const filtrados = alojamientos.filter(a => {
    if (filtroEstado === 'TODOS') return true;
    return a.estadoOperativo === filtroEstado;
  });

  const alojamientoPin = alojamientos.find(a => a.idAlojamiento === alojamientoPinId) || null;
  const alojamientoCheckout = alojamientos.find(a => a.idAlojamiento === alojamientoCheckoutId) || null;
  const alojamientoCronograma = alojamientos.find(a => a.idAlojamiento === alojamientoCronogramaId) || null;

  // Confirmar PIN: Cambia de PENDIENTE a EN_USO
  const handleConfirmarIngresoPin = (idAlojamiento: string, _pin: string) => {
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

    const target = alojamientos.find(a => a.idAlojamiento === idAlojamiento);
    const huesped = target?.reservas?.[0]?.huespedNombre || 'huésped';

    onActualizarAlojamientos(actualizada);
    setAlojamientoPinId(null);
    onMostrarToast(`¡PIN validado con éxito! Llaves entregadas a ${huesped}. Estado actualizado a EN USO.`);
  };

  // Confirmar Check-out: Si hay siguiente reserva pasa a PENDIENTE, si no, pasa a LIBRE
  const handleConfirmarSalida = (idAlojamiento: string) => {
    const actualizada = alojamientos.map(a => {
      if (a.idAlojamiento === idAlojamiento) {
        const reservas = [...(a.reservas || [])];
        reservas.shift(); // Quitamos la reserva finalizada

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

    const target = alojamientos.find(a => a.idAlojamiento === idAlojamiento);
    const tieneSiguiente = (target?.reservas?.length || 0) > 1;

    onActualizarAlojamientos(actualizada);
    setAlojamientoCheckoutId(null);

    if (tieneSiguiente) {
      const proximo = target?.reservas?.[1]?.huespedNombre || 'siguiente viajero';
      onMostrarToast(`Salida registrada. ${target?.titulo} ahora está PENDIENTE DE PIN para ${proximo}.`);
    } else {
      onMostrarToast(`Salida registrada. ${target?.titulo} ahora está LIBRE y disponible.`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
              Recepción &amp; Control de Llaves por PIN
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold">
              Operación Hotelera
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Supervisa los 3 estados operativos: <strong>LIBRE</strong> (disponible), <strong>PENDIENTE</strong> (esperando PIN del viajero) y <strong>EN USO</strong> (hospedado con llaves entregadas).
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            const primeroPendiente = alojamientos.find(a => a.estadoOperativo === 'PENDIENTE') || alojamientos[0];
            if (primeroPendiente) setAlojamientoPinId(primeroPendiente.idAlojamiento);
          }}
          className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-lg shadow-amber-500/25 transition flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <KeyRound className="w-4 h-4" />
          <span>+ Validar PIN de Huésped</span>
        </button>
      </div>

      {/* Pestañas de Filtrado por Estado */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto text-xs font-semibold">
        <button
          type="button"
          onClick={() => setFiltroEstado('TODOS')}
          className={`px-4 py-2 rounded-xl transition ${
            filtroEstado === 'TODOS'
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>Todas las Unidades</span>
          <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">{conteoTodos}</span>
        </button>

        <button
          type="button"
          onClick={() => setFiltroEstado('PENDIENTE')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
            filtroEstado === 'PENDIENTE'
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Pendiente de PIN (Por Llegar)</span>
          <span className="px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
            {conteoPendiente}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFiltroEstado('EN_USO')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
            filtroEstado === 'EN_USO'
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>En Uso (Hospedados)</span>
          <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
            {conteoEnUso}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFiltroEstado('LIBRE')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
            filtroEstado === 'LIBRE'
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          <span>Libres (Disponibles)</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
            {conteoLibre}
          </span>
        </button>
      </div>

      {/* Lista de Unidades y Recepción */}
      <div className="space-y-4">
        {filtrados.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200 dark:border-slate-800">
            No se encontraron unidades en este estado operativo.
          </div>
        ) : (
          filtrados.map(a => {
            const reservaActual = a.reservas?.[0];
            const tieneSiguienteReserva = (a.reservas?.length || 0) > 1;

            return (
              <div
                key={a.idAlojamiento}
                className="p-5 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5 hover:border-blue-400 transition"
              >
                <div className="flex items-start gap-4 flex-1">
                  <img
                    src={a.fotografias[0]?.url}
                    alt={a.titulo}
                    className="w-20 h-20 rounded-2xl object-cover shrink-0"
                  />

                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
                        {a.titulo}
                      </h3>
                      {a.estadoOperativo === 'PENDIENTE' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-xs border border-amber-300 dark:border-amber-800">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          <span>🟡 PENDIENTE DE PIN (Por Ingresar)</span>
                        </span>
                      )}
                      {a.estadoOperativo === 'EN_USO' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs border border-emerald-300 dark:border-emerald-800">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>🟢 EN USO (Huésped Hospedado)</span>
                        </span>
                      )}
                      {a.estadoOperativo === 'LIBRE' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs border border-slate-300 dark:border-slate-700">
                          <span className="w-2 h-2 rounded-full bg-slate-400" />
                          <span>⚪ LIBRE (Disponible)</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {a.ciudad}, {a.departamento} • {a.direccion}
                    </p>

                    {reservaActual ? (
                      <div className="pt-1 flex items-center gap-3 text-xs flex-wrap">
                        <span className="text-slate-700 dark:text-slate-200">
                          Huésped: <strong className="text-blue-600 dark:text-blue-400 font-bold">{reservaActual.huespedNombre}</strong>
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                          Estadía: {reservaActual.desde} hasta {reservaActual.hasta}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="font-bold text-emerald-600 font-mono">
                          Bs. {reservaActual.montoTotal}
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">
                        Propiedad lista para recibir nuevos viajeros.
                      </p>
                    )}

                    {tieneSiguienteReserva && (
                      <div className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1.5 pt-0.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Siguiente Huésped: <strong>{a.reservas?.[1]?.huespedNombre}</strong> ({a.reservas?.[1]?.desde})</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="shrink-0 flex items-center justify-end gap-2">
                  {a.estadoOperativo === 'PENDIENTE' && (
                    <button
                      type="button"
                      onClick={() => setAlojamientoPinId(a.idAlojamiento)}
                      className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>Ingresar PIN de Check-in</span>
                    </button>
                  )}

                  {a.estadoOperativo === 'EN_USO' && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setAlojamientoCheckoutId(a.idAlojamiento)}
                        className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Registrar Salida (Check-out)</span>
                      </button>

                      {tieneSiguienteReserva && (
                        <button
                          type="button"
                          onClick={() => setAlojamientoCronogramaId(a.idAlojamiento)}
                          className="px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center gap-1.5"
                          title="Ver Próxima Reserva"
                        >
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span>Ver Cronograma</span>
                        </button>
                      )}
                    </div>
                  )}

                  {a.estadoOperativo === 'LIBRE' && (
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
        onConfirmarIngreso={handleConfirmarIngresoPin}
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
