import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import { reservasService } from '../../reservas/services/reservasService';
import { ConfirmarCheckoutModal } from '../../reservas/modals/ConfirmarCheckoutModal';
import { ReservaResponse } from '../../reservas/types/reserva.types';
import { KeyRound, CheckCircle2, AlertCircle, Loader2, ArrowRight, Calendar, RefreshCw, LogOut } from 'lucide-react';

interface ValidadorPinCheckinProps {
  reservaIdDefecto?: string;
}

export const ValidadorPinCheckin: React.FC<ValidadorPinCheckinProps> = ({
  reservaIdDefecto = '',
}) => {
  const { user } = useAuth();
  const [reservasPendientes, setReservasPendientes] = useState<any[]>([]);
  const [cargandoLista, setCargandoLista] = useState(false);
  const [reservaId, setReservaId] = useState(reservaIdDefecto);
  const [pin, setPin] = useState('');
  const [notas, setNotas] = useState('Huésped verificado en recepción, llaves entregadas.');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Modal Checkout Anfitrión
  const [reservaACheckout, setReservaACheckout] = useState<ReservaResponse | null>(null);

  const cargarReservas = async () => {
    setCargandoLista(true);
    try {
      const anfitrionId = user?.id || '8fff278f-8dfd-47da-94bb-6e658b6f7178';
      let lista: any[] = [];
      try {
        lista = await reservasService.listarPorAnfitrion(anfitrionId);
      } catch {
        lista = await reservasService.listarTodas();
      }

      if (Array.isArray(lista)) {
        setReservasPendientes(lista);
        if (!reservaId && lista.length > 0) {
          const pendiente = lista.find(r => r.estado === 'CONFIRMADA' || r.estado === 'PENDIENTE_PAGO') || lista[0];
          setReservaId(pendiente.idReserva);
          if (pendiente.codigoCheckin) {
            setPin(pendiente.codigoCheckin);
          }
        }
      }
    } catch (err) {
      console.warn('Error al cargar lista de reservas:', err);
    } finally {
      setCargandoLista(false);
    }
  };

  useEffect(() => {
    cargarReservas();
  }, [user]);

  const seleccionarReserva = (reserva: any) => {
    setReservaId(reserva.idReserva);
    if (reserva.codigoCheckin) {
      setPin(reserva.codigoCheckin);
    }
    setResultado(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservaId || pin.length !== 6) return;
    setError(null);
    setResultado(null);
    setLoading(true);

    try {
      const res = await reservasService.realizarCheckIn(reservaId, pin, notas);
      setResultado(res);
      // Actualizar lista local
      setReservasPendientes(prev => prev.map(r => r.idReserva === reservaId ? { ...r, estado: 'CHECK_IN' } : r));
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error: Clave PIN incorrecta o reserva no encontrada.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckoutHostExitoso = (reservaCompletada: ReservaResponse) => {
    setReservasPendientes(prev =>
      prev.map(r => (r.idReserva === reservaCompletada.idReserva ? { ...r, estado: 'COMPLETADA' } : r))
    );
    setReservaACheckout(null);
    setResultado({
      estado: 'COMPLETADA',
      nombreCliente: reservaCompletada.nombreCliente,
      nombreUnidad: reservaCompletada.nombreUnidad,
    });
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-blue-500/25 shrink-0">
            <KeyRound className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
              RECEPCIÓN DE HUÉSPEDES • CONTROL PRESENCIAL
            </span>
            <h4 className="font-serif text-xl font-bold text-slate-900 dark:text-white leading-tight">
              Recepción y Salida de Huéspedes
            </h4>
          </div>
        </div>

        <button
          type="button"
          onClick={cargarReservas}
          disabled={cargandoLista}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          title="Actualizar lista de reservas"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${cargandoLista ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refrescar</span>
        </button>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Valida el código PIN de 6 dígitos que presenta el huésped a su llegada para autorizar el ingreso, o registra la entrega de llaves y salida al concluir su estadía.
      </p>

      {/* Lista de Reservas Activas para Selección Rápida */}
      {reservasPendientes.length > 0 && (
        <div className="space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Reservas Registradas ({reservasPendientes.length}) — Clic para seleccionar:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {reservasPendientes.map((r) => {
              const esSeleccionada = r.idReserva === reservaId;
              const esCheckIn = r.estado === 'CHECK_IN' || r.estado === 'CHECKIN_REALIZADO';
              const esCompletada = r.estado === 'COMPLETADA';
              const esCancelada = r.estado === 'CANCELADA';

              return (
                <div
                  key={r.idReserva}
                  onClick={() => seleccionarReserva(r)}
                  className={`p-3 rounded-2xl border text-left transition text-xs flex flex-col justify-between cursor-pointer ${
                    esSeleccionada
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 dark:text-white truncate">
                      {r.nombreCliente || 'Huésped Aloja-Te'}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        esCheckIn
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          : esCompletada
                          ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          : esCancelada
                          ? 'bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                      }`}
                    >
                      {esCheckIn
                        ? 'Hospedaje en curso'
                        : esCompletada
                        ? 'Estadía concluida'
                        : esCancelada
                        ? 'Cancelada'
                        : 'Lista para ingresar'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span>
                        {r.checkIn} al {r.checkOut}
                      </span>
                    </div>
                    {r.horaEstimadaLlegada && (
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                        Llegada: {r.horaEstimadaLlegada}
                      </span>
                    )}
                  </div>

                  {r.codigoCheckin && (
                    <div className="mt-1.5 flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px]">
                      <span className="text-slate-400">PIN Asignado:</span>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {r.codigoCheckin}
                      </span>
                    </div>
                  )}

                  {/* Botón para Check-out si el huésped ya hizo check-in */}
                  {esCheckIn && (
                    <div className="mt-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 flex justify-end">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReservaACheckout(r);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] flex items-center gap-1 transition shadow-sm"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Registrar Salida (Check-out)</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {resultado && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-200 text-xs space-y-1.5 animate-fade-in">
          <div className="flex items-center gap-2 font-bold text-sm text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              {resultado.estado === 'COMPLETADA'
                ? '¡Salida Registrada con Éxito!'
                : '¡Ingreso Autorizado con Éxito!'}
            </span>
          </div>
          <p className="text-slate-700 dark:text-slate-300">
            {resultado.estado === 'COMPLETADA'
              ? 'La habitación ha quedado libre y las llaves han sido devueltas a recepción.'
              : 'El huésped ha recibido sus llaves y la estadía se encuentra formalmente en curso.'}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Huésped: {resultado.nombreCliente || 'Registrado'} • Unidad:{' '}
            {resultado.nombreUnidad || 'Alojamiento'}
          </p>
        </div>
      )}

      {/* Formulario de Verificación de PIN */}
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Código ID de Reserva
          </label>
          <input
            type="text"
            value={reservaId}
            onChange={(e) => setReservaId(e.target.value)}
            required
            placeholder="Selecciona una reserva o ingresa el código"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Código PIN de 6 Dígitos
          </label>
          <input
            type="text"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            required
            placeholder="256723"
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-center tracking-widest text-2xl font-black text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Notas de Recepción
          </label>
          <input
            type="text"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading || pin.length !== 6 || !reservaId}
          className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/25 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verificando clave de seguridad...</span>
            </>
          ) : (
            <>
              <span>Validar PIN y Autorizar Ingreso</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Modal de Salida (Check-out) para Anfitrión */}
      <ConfirmarCheckoutModal
        reserva={reservaACheckout}
        isOpen={!!reservaACheckout}
        esAnfitrion={true}
        onClose={() => setReservaACheckout(null)}
        onCheckoutExitoso={handleCheckoutHostExitoso}
      />
    </div>
  );
};
