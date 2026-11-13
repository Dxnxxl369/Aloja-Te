import React, { useState, useEffect } from 'react';
import { ReservaResponse } from '../../reservas/types/reserva.types';
import { pagosService } from '../services/pagosService';
import { reservasService } from '../../reservas/services/reservasService';
import { PagoResponseData } from '../types/checkout.types';
import { API_BASE_URL } from '../../../core/api/apiEndpoints';
import { useAuth } from '../../../core/auth/AuthContext';
import { X, QrCode, Clock, ShieldCheck, Tag, Check, Loader2, AlertCircle, Sparkles, Building2, Copy } from 'lucide-react';

interface CheckoutPagoModalProps {
  reserva: ReservaResponse | null;
  onClose: () => void;
  onPagoCompletado: (pagoData: any, pinCheckin: string) => void;
}

export const CheckoutPagoModal: React.FC<CheckoutPagoModalProps> = ({
  reserva,
  onClose,
  onPagoCompletado,
}) => {
  const { user } = useAuth();
  const [pago, setPago] = useState<PagoResponseData | null>(null);
  const [cupon, setCupon] = useState('');
  const [cuponAplicado, setCuponAplicado] = useState(false);
  const [metodoPago, setMetodoPago] = useState<'QR' | 'TRANSFERENCIA'>('QR');
  const [copiado, setCopiado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutos en segundos
  const [qrOficialUrl, setQrOficialUrl] = useState<string | null>(null);
  const [qrError, setQrError] = useState(false);
  const [bancoCliente, setBancoCliente] = useState('Banco Mercantil Santa Cruz (BMSC)');
  const [cuentaCliente, setCuentaCliente] = useState('');
  const [comprobanteRef, setComprobanteRef] = useState('');
  const [datosBanco, setDatosBanco] = useState({
    banco: 'Cargando entidad bancaria...',
    cuenta: '',
    titular: 'Administración Aloja-Te'
  });

  useEffect(() => {
    // Cargar QR y datos bancarios oficiales configurados por el Administrador
    const cargarQrOficial = async () => {
      try {
        const resp = await fetch(`${API_BASE_URL}/api/v1/pagos/qr-oficial?t=${Date.now()}`);
        if (resp.ok) {
          const data = await resp.json();
          if (data.qr) {
            setQrOficialUrl(data.qr);
            setQrError(false);
          }
          if (data.bancoNombre) {
            setDatosBanco(prev => ({
              ...prev,
              banco: data.bancoNombre,
              cuenta: data.numeroCuentaBancaria || prev.cuenta
            }));
          }
        }
      } catch (err) {
        console.warn('No se pudo cargar QR oficial:', err);
      }
    };
    cargarQrOficial();
  }, [reserva, metodoPago]);

  useEffect(() => {
    if (!reserva) return;
    iniciarProcesoPago();
  }, [reserva]);

  // Temporizador de 15 minutos
  useEffect(() => {
    if (timeLeft <= 0) {
      if (reserva && reserva.estado === 'PENDIENTE_PAGO') {
        reservasService.cancelarReserva(reserva.idReserva, 'EXPIRACION_15_MIN').catch(() => {});
      }
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, reserva]);

  const handleCerrar = async () => {
    if (reserva && reserva.estado === 'PENDIENTE_PAGO') {
      try {
        await reservasService.cancelarReserva(reserva.idReserva, 'EXPIRACION_15_MIN');
      } catch (e) {
        console.warn('Liberación de inventario:', e);
      }
    }
    onClose();
  };

  const iniciarProcesoPago = async (codigoPromo?: string) => {
    if (!reserva) return;
    setLoading(true);
    setError(null);

    try {
      const data = await pagosService.iniciarPago({
        reservaId: reserva.idReserva,
        anfitrionId: reserva.idAnfitrion,
        subtotal: reserva.importeTotal,
        codigoPromocion: codigoPromo || undefined,
        metodoPago: metodoPago === 'QR' ? 'QR_OFICIAL' : 'TRANSFERENCIA_BANCARIA',
      });
      setPago(data);
      if (codigoPromo && data.descuento > 0) {
        setCuponAplicado(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al iniciar el proceso de pago.');
    } finally {
      setLoading(false);
    }
  };

  const aplicarCupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cupon.trim()) return;
    iniciarProcesoPago(cupon.trim());
  };

  const copiarDatosCuenta = () => {
    const glosa = `Reserva #${reserva?.idReserva?.slice(-6).toUpperCase() || reserva?.idReserva || ''}`;
    const texto = `Banco: ${datosBanco.banco}\nN° de Cuenta: ${datosBanco.cuenta}\nMotivo: ${glosa}`;
    navigator.clipboard?.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const confirmarPago = async () => {
    if (!pago || !reserva) return;
    setConfirmando(true);
    setError(null);

    try {
      // 1. Confirmar pago registrado en el sistema y despachar factura por correo
      const refBancaria = comprobanteRef.trim() || `TRX-${Date.now().toString().slice(-6)}`;
      const resultado = await pagosService.confirmarPagoWebhook(pago.pagoId, refBancaria, {
        clienteEmail: user?.email || (reserva as any).clienteEmail || 'cliente@alojate.bo',
        clienteNombre: user ? `${user.nombre} ${user.apellido || ''}`.trim() : reserva.nombreCliente,
        tituloAlojamiento: reserva.tituloAlojamiento,
        checkIn: reserva.checkIn,
        checkOut: reserva.checkOut,
        codigoCheckin: reserva.codigoCheckin,
        metodoPago: metodoPago === 'TRANSFERENCIA' ? 'Transferencia Bancaria' : 'Código QR Oficial',
        montoTotal: pago.montoTotal || reserva.importeTotal
      });
      
      // 2. Ejecutar Saga en MS-02: Confirmar Reserva y asignar PIN de Check-in
      let reservaConfirmada = reserva;
      try {
        reservaConfirmada = await reservasService.confirmarPagoSaga(
          reserva.idReserva,
          pago.pagoId,
          resultado.transaccionId || refBancaria,
          metodoPago === 'TRANSFERENCIA' ? 'TRANSFERENCIA_BANCARIA' : 'QR_OFICIAL'
        );
      } catch (sagaErr) {
        console.warn('Saga MS-02 confirmación:', sagaErr);
      }

      // 3. Notificar al componente padre con la factura y el PIN de check-in
      onPagoCompletado(resultado, reservaConfirmada.codigoCheckin || reserva.codigoCheckin);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al procesar la confirmación del pago.');
    } finally {
      setConfirmando(false);
    }
  };

  if (!reserva) return null;

  if (timeLeft <= 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
        <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-2xl animate-modal-in">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <Clock className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
            Tiempo de Pago Expirado
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Han transcurrido los 15 minutos asignados para completar el pago. El bloqueo temporal de fechas ha sido liberado para otros huéspedes.
          </p>
          <button
            onClick={handleCerrar}
            className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition cursor-pointer"
          >
            Seleccionar Fechas y Reintentar
          </button>
        </div>
      </div>
    );
  }

  const minutos = Math.floor(timeLeft / 60);
  const segundos = timeLeft % 60;
  const esAlertaCritica = timeLeft < 120; // Menos de 2 minutos

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md transition-all duration-300 animate-fade-in overflow-y-auto">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={handleCerrar} />

      {/* Main Container Ampliado */}
      <div className="relative w-full max-w-3xl my-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 z-10 overflow-hidden animate-modal-in flex flex-col">
        
        {/* Header Limpio */}
        <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-blue-500/25 shrink-0 mt-0.5">
                2
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                  PASO 2 DE 2 • CONFIRMACIÓN DE RESERVA
                </span>
                <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                  Pago y Confirmación de Estadía
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Realiza el pago a la cuenta bancaria oficial y confirma tus datos para finalizar.
                </p>
              </div>
            </div>

            <button
              onClick={handleCerrar}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
              title="Cerrar modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-4">
            <div className="h-full bg-blue-600 transition-all duration-300 w-full" />
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-6 sm:px-8 py-5 space-y-4 overflow-y-auto max-h-[75vh]">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Timer Countdown Bar */}
          <div className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs transition-colors ${
            esAlertaCritica
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 animate-pulse'
              : 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200/70 dark:border-blue-900/50 text-slate-700 dark:text-slate-300'
          }`}>
            <div className="flex items-center gap-2 font-medium">
              <Clock className={`w-4 h-4 ${esAlertaCritica ? 'text-amber-600' : 'text-blue-600 dark:text-blue-400'} animate-pulse`} />
              <span>{esAlertaCritica ? '¡Atención! Tiempo por agotarse:' : 'Tiempo restante para completar el pago:'}</span>
            </div>
            <span className={`font-mono font-bold text-sm px-2.5 py-0.5 rounded-lg shadow-sm border ${
              esAlertaCritica
                ? 'bg-amber-600 text-white border-amber-700'
                : 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900/60'
            }`}>
              {minutos.toString().padStart(2, '0')}:{segundos.toString().padStart(2, '0')}
            </span>
          </div>

          {/* Selector de Método de Pago */}
          <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 gap-1 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setMetodoPago('QR')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                metodoPago === 'QR'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Pago con Código QR</span>
            </button>
            <button
              type="button"
              onClick={() => setMetodoPago('TRANSFERENCIA')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                metodoPago === 'TRANSFERENCIA'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Transferencia Bancaria</span>
            </button>
          </div>

          {/* Main Grid: Payment Details & Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Columna Izquierda */}
            {metodoPago === 'QR' ? (
              <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 flex flex-col items-center justify-center text-center space-y-3">
                {loading ? (
                  <div className="py-14 flex flex-col items-center gap-2 text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="text-xs">Cargando código QR oficial...</span>
                  </div>
                ) : (
                  <>
                    <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200/80 flex items-center justify-center">
                      {qrOficialUrl && !qrError ? (
                        <div className="w-52 h-52 bg-white rounded-xl p-1 flex items-center justify-center relative overflow-hidden">
                          <img
                            src={qrOficialUrl}
                            alt="Código QR Oficial"
                            className="w-full h-full object-contain"
                            onError={() => setQrError(true)}
                          />
                        </div>
                      ) : (
                        <div className="w-48 h-48 bg-slate-900 rounded-xl p-3 flex flex-col items-center justify-center relative shadow-inner text-white">
                          <QrCode className="w-28 h-28 text-white/90" />
                          <span className="text-[10px] font-bold text-slate-300 mt-2 tracking-wider">CÓDIGO QR OFICIAL</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 w-full text-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Entidad Bancaria Oficial
                      </span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                        {datosBanco.banco}
                      </h4>
                      {datosBanco.cuenta && (
                        <p className="text-xs text-slate-500 font-mono">
                          N° de Cuenta: <span className="font-bold text-blue-600 dark:text-blue-400">{datosBanco.cuenta}</span>
                        </p>
                      )}                      
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Pestaña Transferencia Bancaria: Datos del Administrador Grandes y Claros */
              <div className="p-5 rounded-2xl border border-blue-200/80 dark:border-slate-800 bg-gradient-to-br from-blue-50/60 to-slate-50 dark:from-slate-800/80 dark:to-slate-800/40 flex flex-col justify-between space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider block">
                      Cuenta Oficial de Destino
                    </span>                   
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                    {datosBanco.banco}
                  </h3>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700/80 space-y-3 shadow-sm">
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans block mb-0.5">Número de Cuenta Bancaria:</span>
                    <span className="text-base font-mono font-black text-blue-600 dark:text-blue-400 tracking-wider">
                      {datosBanco.cuenta}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-[11px] text-slate-400 font-sans">Glosa / Motivo Requerido:</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-sans">
                      Reserva #{reserva.idReserva.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  
                </div>

                <button
                  type="button"
                  onClick={copiarDatosCuenta}
                  className="w-full py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer border border-blue-200 dark:border-slate-700 shadow-sm"
                >
                  {copiado ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>¡Datos bancarios copiados al portapapeles!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar datos de cuenta bancaria</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Columna Derecha */}
            <div className="flex flex-col justify-between space-y-3.5 text-xs">
              
              {/* SOLO en modo Transferencia: Formulario para que el cliente ingrese su cuenta de origen */}
              {metodoPago === 'TRANSFERENCIA' && (
                <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 space-y-2.5 animate-in fade-in duration-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                    Datos de tu Transferencia (Cuenta de Origen)
                  </span>

                  <div className="space-y-1">
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Tu Entidad Bancaria Emisora
                    </label>
                    <select
                      value={bancoCliente}
                      onChange={(e) => setBancoCliente(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="Banco Nacional de Bolivia (BNB)">Banco Nacional de Bolivia (BNB)</option>
                      <option value="Banco Mercantil Santa Cruz (BMSC)">Banco Mercantil Santa Cruz (BMSC)</option>
                      <option value="Banco Unión S.A.">Banco Unión S.A.</option>
                      <option value="Banco BISA S.A.">Banco BISA S.A.</option>
                      <option value="Banco Ganadero S.A.">Banco Ganadero S.A.</option>
                      <option value="Banco de Crédito de Bolivia (BCP)">Banco de Crédito de Bolivia (BCP)</option>
                      <option value="Banco Económico S.A.">Banco Económico S.A.</option>
                      <option value="Billetera Móvil / Yape / Tigo Money">Billetera Móvil / Yape / Tigo Money</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Tu Número de Cuenta o Celular de Origen
                    </label>
                    <input
                      type="text"
                      value={cuentaCliente}
                      onChange={(e) => setCuentaCliente(e.target.value)}
                      placeholder="Ej. 4010928371 o 71234567"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      N° de Referencia / Comprobante (Opcional)
                    </label>
                    <input
                      type="text"
                      value={comprobanteRef}
                      onChange={(e) => setComprobanteRef(e.target.value)}
                      placeholder="Ej. TRX-90281"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* En modo QR: Resumen informativo directo */}
              {metodoPago === 'QR' && (
                <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 space-y-2.5 animate-in fade-in duration-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                    Instrucciones de Pago QR
                  </span>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside">
                    <li>Abre la aplicación de banca móvil de tu preferencia.</li>
                    <li>Selecciona la opción de escanear código QR de cobro.</li>
                    <li>Verifica que el monto coincida exactamente con el total.</li>
                    <li>Al completar la transferencia, presiona el botón confirmar.</li>
                  </ul>
                </div>
              )}

              {/* Promo Code Input (Opcional) */}
              <form onSubmit={aplicarCupon} className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={cupon}
                      onChange={(e) => setCupon(e.target.value.toUpperCase())}
                      placeholder="Cupón de Descuento (Opcional)"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !cupon.trim()}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs transition shadow-sm cursor-pointer"
                  >
                    Aplicar
                  </button>
                </div>
                {cuponAplicado && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                    <Check className="w-3.5 h-3.5" /> Cupón aplicado exitosamente
                  </span>
                )}
              </form>

              {/* Financial Breakdown */}
              <div className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 space-y-1.5 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between items-center">
                  <span>Subtotal estadía:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{pago?.subtotalAlojamiento || reserva.importeTotal} BOB</span>
                </div>

                {pago && pago.descuento > 0 && (
                  <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                    <span>Descuento aplicado:</span>
                    <span className="font-semibold">-{pago.descuento} BOB</span>
                  </div>
                )}

                {pago && pago.cargoServicio > 0 && (
                  <div className="flex justify-between items-center text-slate-400 text-[11px]">
                    <span>Cargo de servicio:</span>
                    <span>+{pago.cargoServicio} BOB</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80 flex justify-between items-baseline font-bold text-slate-900 dark:text-white">
                  <span>Total a Pagar:</span>
                  <span className="text-2xl text-blue-600 dark:text-blue-400 font-black font-mono">
                    {pago?.montoTotal || reserva.importeTotal} BOB
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* Action Button & Disclaimer */}
          <div className="space-y-2 pt-2">
            <button
              onClick={confirmarPago}
              disabled={confirmando || loading}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/25 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {confirmando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Procesando pago y confirmando reserva...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-200" />
                  <span>Confirmar Pago</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-slate-400 leading-relaxed">
              Al confirmar, tu reserva quedará registrada en el sistema y se generará tu comprobante junto con tu código PIN para el check-in.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
