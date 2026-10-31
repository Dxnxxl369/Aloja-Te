import React, { useState } from 'react';
import { ReservaResponse } from '../../reservas/types/reserva.types';
import { CancelacionReservaModal } from '../../reservas/modals/CancelacionReservaModal';
import { ConfirmarCheckoutModal } from '../../reservas/modals/ConfirmarCheckoutModal';
import { KeyRound, Calendar, Copy, Check, Clock, User, LogOut, XCircle, Star, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';

interface MisViajesViewProps {
  reservas: ReservaResponse[];
  onNuevaReserva: () => void;
  onActualizarReservas?: (nuevas: ReservaResponse[]) => void;
  onDejarResena?: (alojamientoId: string, unidadId?: string) => void;
}

type TabFiltro = 'TODAS' | 'PROXIMAS' | 'EN_CURSO' | 'CONCLUIDAS' | 'CANCELADAS';

export const MisViajesView: React.FC<MisViajesViewProps> = ({
  reservas,
  onNuevaReserva,
  onActualizarReservas,
  onDejarResena,
}) => {
  const { user, openAuthModal } = useAuth();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabFiltro>('TODAS');

  // Modales
  const [reservaACancelar, setReservaACancelar] = useState<ReservaResponse | null>(null);
  const [reservaACheckout, setReservaACheckout] = useState<ReservaResponse | null>(null);

  const handleCopy = (pin: string, id: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCancelacionExitosa = (reservaCancelada: ReservaResponse) => {
    const actualizadas = reservas.map((r) =>
      r.idReserva === reservaCancelada.idReserva ? { ...r, estado: 'CANCELADA' as const } : r
    );
    if (onActualizarReservas) {
      onActualizarReservas(actualizadas);
    }
    setReservaACancelar(null);
  };

  const handleCheckoutExitoso = (reservaCompletada: ReservaResponse, abrirResena: boolean) => {
    const actualizadas = reservas.map((r) =>
      r.idReserva === reservaCompletada.idReserva ? { ...r, estado: 'COMPLETADA' as const } : r
    );
    if (onActualizarReservas) {
      onActualizarReservas(actualizadas);
    }
    setReservaACheckout(null);

    if (abrirResena && onDejarResena) {
      onDejarResena(reservaCompletada.idAlojamiento, reservaCompletada.idUnidad);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto mb-4 shadow-sm">
          <User className="w-8 h-8" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Inicia sesión para consultar tus viajes
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
          Accede a tu cuenta para gestionar tus reservas activas, ver tus claves de acceso y solicitar cancelaciones con reembolso inmediato.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition cursor-pointer"
        >
          Iniciar Sesión
        </button>
      </div>
    );
  }

  // Filtrado reactivo por pestañas
  const reservasFiltradas = reservas.filter((reserva) => {
    if (activeTab === 'TODAS') return true;
    if (activeTab === 'PROXIMAS') {
      return reserva.estado === 'CONFIRMADA' || reserva.estado === 'PENDIENTE_PAGO';
    }
    if (activeTab === 'EN_CURSO') {
      return reserva.estado === 'CHECKIN_REALIZADO' || (reserva.estado as string) === 'CHECK_IN';
    }
    if (activeTab === 'CONCLUIDAS') {
      return reserva.estado === 'COMPLETADA';
    }
    if (activeTab === 'CANCELADAS') {
      return reserva.estado === 'CANCELADA';
    }
    return true;
  });

  const conteos = {
    TODAS: reservas.length,
    PROXIMAS: reservas.filter(r => r.estado === 'CONFIRMADA' || r.estado === 'PENDIENTE_PAGO').length,
    EN_CURSO: reservas.filter(r => r.estado === 'CHECKIN_REALIZADO' || (r.estado as string) === 'CHECK_IN').length,
    CONCLUIDAS: reservas.filter(r => r.estado === 'COMPLETADA').length,
    CANCELADAS: reservas.filter(r => r.estado === 'CANCELADA').length,
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Encabezado */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 block mb-1">
              ITINERARIO &amp; HOSPEDAJE
            </span>
            <h2 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">
              Mis Viajes y Reservas
            </h2>
          </div>

          <button
            onClick={onNuevaReserva}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition self-start sm:self-auto cursor-pointer"
          >
            + Explorar Destinos
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Consulta los detalles de tus estadías, presenta tu PIN en recepción o gestiona cambios y cancelaciones con garantía de reembolso.
        </p>

        {/* Pestañas de Navegación por Estado */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-5 no-scrollbar">
          {(
            [
              { id: 'TODAS', label: 'Todas las Reservas', count: conteos.TODAS },
              { id: 'PROXIMAS', label: 'Próximos Viajes', count: conteos.PROXIMAS },
              { id: 'EN_CURSO', label: 'En Curso', count: conteos.EN_CURSO },
              { id: 'CONCLUIDAS', label: 'Concluidas', count: conteos.CONCLUIDAS },
              { id: 'CANCELADAS', label: 'Canceladas', count: conteos.CANCELADAS },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Reservas o Empty State */}
      {reservasFiltradas.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto mb-3">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white mb-1">
            No hay registros en esta sección
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
            {activeTab === 'TODAS'
              ? 'Aún no has realizado ninguna reserva en los alojamientos disponibles.'
              : `No tienes reservaciones clasificadas como "${activeTab.toLowerCase()}".`}
          </p>
          <button
            onClick={onNuevaReserva}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition cursor-pointer"
          >
            Explorar Alojamientos en Bolivia
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reservasFiltradas.map((reserva) => {
            const esEnCurso =
              reserva.estado === 'CHECKIN_REALIZADO' || (reserva.estado as string) === 'CHECK_IN';
            const esConfirmada =
              reserva.estado === 'CONFIRMADA' || reserva.estado === 'PENDIENTE_PAGO';
            const esCompletada = reserva.estado === 'COMPLETADA';
            const esCancelada = reserva.estado === 'CANCELADA';

            return (
              <div
                key={reserva.idReserva}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-slate-300 dark:hover:border-slate-700 transition"
              >
                {/* Detalles de la Estadía */}
                <div className="space-y-2.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Badge de Estado Amigable */}
                    {esConfirmada && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>Confirmada • Lista para Viajar</span>
                      </span>
                    )}
                    {esEnCurso && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        <span>Hospedaje en Curso</span>
                      </span>
                    )}
                    {esCompletada && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 flex items-center gap-1">
                        <Check className="w-3 h-3 text-slate-500" />
                        <span>Estadía Concluida con Éxito</span>
                      </span>
                    )}
                    {esCancelada && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-900 flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-red-500" />
                        <span>Cancelada • Devolución Acreditada</span>
                      </span>
                    )}

                    <span className="text-[10px] text-slate-400 font-mono">
                      Ref: {reserva.idReserva.slice(0, 8)}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-serif text-xl font-bold text-slate-900 dark:text-white truncate">
                      {reserva.tituloAlojamiento}
                    </h4>
                    {reserva.nombreUnidad && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                        {reserva.nombreUnidad}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      {reserva.checkIn} al {reserva.checkOut} ({reserva.nochesEstadia} noches)
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      Importe: {reserva.importeTotal} {reserva.moneda || 'BOB'}
                    </span>
                  </div>

                  {/* Acciones para el Cliente */}
                  <div className="pt-2 flex flex-wrap items-center gap-2.5">
                    {/* Botón Gestionar Cancelación si está confirmada */}
                    {esConfirmada && (
                      <button
                        type="button"
                        onClick={() => setReservaACancelar(reserva)}
                        className="px-3.5 py-1.5 rounded-xl border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5 text-red-500" />
                        <span>Gestionar Cancelación</span>
                      </button>
                    )}

                    {/* Botón Finalizar Salida si está en curso */}
                    {esEnCurso && (
                      <button
                        type="button"
                        onClick={() => setReservaACheckout(reserva)}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-sm cursor-pointer flex items-center gap-1.5"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Completar Salida (Check-out)</span>
                      </button>
                    )}

                    {/* Botón Dejar Reseña si está completada */}
                    {esCompletada && (
                      <button
                        type="button"
                        onClick={() => {
                          if (onDejarResena) {
                            onDejarResena(reserva.idAlojamiento, reserva.idUnidad);
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-sm cursor-pointer flex items-center gap-1.5"
                      >
                        <Star className="w-3.5 h-3.5 fill-current text-white" />
                        <span>Calificar Estadía y Experiencia</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Recuadro de Clave PIN / Estado de Recepción */}
                <div className="w-full md:w-auto p-4 rounded-2xl bg-slate-900 dark:bg-slate-950 border border-blue-500/30 text-center md:text-right shrink-0 space-y-1.5 min-w-[210px]">
                  <div className="flex items-center justify-between md:justify-end gap-2 mb-0.5">
                    <div className="flex items-center gap-1.5 text-blue-400 text-[11px] font-bold">
                      <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                      <span>Clave de Ingreso (PIN)</span>
                    </div>
                    {reserva.codigoCheckin && (
                      <button
                        onClick={() => handleCopy(reserva.codigoCheckin, reserva.idReserva)}
                        className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 transition cursor-pointer"
                        title="Copiar código PIN"
                      >
                        {copiedId === reserva.idReserva ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>

                  <span className="font-mono text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 tracking-widest block">
                    {reserva.codigoCheckin || '------'}
                  </span>

                  <div className="pt-1.5 border-t border-white/10 text-[10px]">
                    {esEnCurso && (
                      <span className="text-emerald-400 font-bold flex items-center justify-center md:justify-end gap-1">
                        <Check className="w-3 h-3" />
                        <span>Ingreso Confirmado en Recepción</span>
                      </span>
                    )}
                    {esConfirmada && (
                      <span className="text-slate-400 block">
                        Presenta esta clave al anfitrión al llegar
                      </span>
                    )}
                    {esCompletada && (
                      <span className="text-slate-400 block">
                        Estadía concluida satisfactoriamente
                      </span>
                    )}
                    {esCancelada && (
                      <span className="text-slate-400 block">
                        Reserva anulada y fechas liberadas
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Cancelación y Reembolso */}
      <CancelacionReservaModal
        reserva={reservaACancelar}
        isOpen={!!reservaACancelar}
        onClose={() => setReservaACancelar(null)}
        onCancelacionExitosa={handleCancelacionExitosa}
      />

      {/* Modal de Checkout / Salida */}
      <ConfirmarCheckoutModal
        reserva={reservaACheckout}
        isOpen={!!reservaACheckout}
        esAnfitrion={false}
        onClose={() => setReservaACheckout(null)}
        onCheckoutExitoso={handleCheckoutExitoso}
      />
    </div>
  );
};
