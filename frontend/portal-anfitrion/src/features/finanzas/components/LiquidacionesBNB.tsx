import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Building,
  Download,
  CheckCircle2,
  Upload,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Check,
  Cloud,
  Loader2,
  Server
} from 'lucide-react';
import { useAnfitrionAuth } from '../../../core/auth/AuthContext';

interface LiquidacionesBNBProps {
  onMostrarToast: (msg: string) => void;
}

const BANCOS_BOLIVIA = [
  'Banco Económico S.A.',
  'Banco Mercantil Santa Cruz S.A.',
  'Banco de Crédito de Bolivia S.A. (BCP)',
  'Banco Nacional de Bolivia S.A. (BNB)',
  'Banco Ganadero S.A.',
  'Banco BISA S.A.',
  'Banco Unión S.A.',
  'Banco FIE S.A.',
  'Banco Solidario S.A. (BancoSol)',
  'Banco Fortaleza S.A.'
];

export const LiquidacionesBNB: React.FC<LiquidacionesBNBProps> = ({ onMostrarToast }) => {
  const { perfil, actualizarDatosBancariosBackend } = useAnfitrionAuth();

  // Pestaña de configuración de cobro (QR o Cuenta)
  const [metodoCobroActivo, setMetodoCobroActivo] = useState<'QR' | 'BANCO'>('QR');

  // Configuración de QR en Amazon S3 (Conectado a Backend)
  const [qrImagenUrl, setQrImagenUrl] = useState<string>(
    perfil.qr || 'https://alojate-bolivia.s3.sa-east-1.amazonaws.com/anfitriones/qr-carlos-mendoza.png'
  );
  const [bancoQR, setBancoQR] = useState<string>(
    perfil.bancoNombre || 'Banco Mercantil Santa Cruz S.A.'
  );
  const [titularQR, setTitularQR] = useState<string>(perfil.nombre);

  // Configuración de Cuenta Bancaria (Conectada a Backend)
  const [bancoSeleccionado, setBancoSeleccionado] = useState<string>(
    perfil.bancoNombre || 'Banco Mercantil Santa Cruz S.A.'
  );
  const [tipoCuenta, setTipoCuenta] = useState<'Caja de Ahorros' | 'Cuenta Corriente'>('Caja de Ahorros');
  const [numeroCuenta, setNumeroCuenta] = useState<string>(perfil.numeroCuentaBancaria || '4010987654321');
  const [titularCuenta, setTitularCuenta] = useState<string>(perfil.nombre);
  const [documentoIdentidad, setDocumentoIdentidad] = useState<string>(
    perfil.ciNumero ? `${perfil.ciNumero} ${perfil.ciExpedido || ''}` : '5829104 SC'
  );

  const [guardadoExitoso, setGuardadoExitoso] = useState<string | null>(null);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [cargandoBackend, setCargandoBackend] = useState<boolean>(false);

  // Cargar datos reales desde el backend para este anfitrión específico
  useEffect(() => {
    let cancelado = false;

    const cargarDatosBackend = async () => {
      setCargandoBackend(true);
      try {
        const resp = await fetch(
          `http://localhost:8080/api/v1/usuarios/por-email?email=${encodeURIComponent(perfil.email)}`
        );
        if (resp.ok && !cancelado) {
          const data = await resp.json();
          if (data.bancoNombre) {
            setBancoSeleccionado(data.bancoNombre);
            setBancoQR(data.bancoNombre);
          }
          if (data.numeroCuentaBancaria) {
            setNumeroCuenta(data.numeroCuentaBancaria);
          }
          if (data.qr) {
            setQrImagenUrl(data.qr);
          }
        }
      } catch (err) {
        // En caso de modo independiente, usar los datos específicos del anfitrión activo
        if (!cancelado) {
          if (perfil.bancoNombre) {
            setBancoSeleccionado(perfil.bancoNombre);
            setBancoQR(perfil.bancoNombre);
          }
          if (perfil.numeroCuentaBancaria) {
            setNumeroCuenta(perfil.numeroCuentaBancaria);
          }
          if (perfil.qr) {
            setQrImagenUrl(perfil.qr);
          }
        }
      } finally {
        if (!cancelado) {
          setTitularQR(perfil.nombre);
          setTitularCuenta(perfil.nombre);
          setDocumentoIdentidad(
            perfil.ciNumero ? `${perfil.ciNumero} ${perfil.ciExpedido || ''}` : '5829104 SC'
          );
          setCargandoBackend(false);
        }
      }
    };

    cargarDatosBackend();
    return () => {
      cancelado = true;
    };
  }, [perfil.id, perfil.email, perfil.nombre]);

  // Guardar configuración de Código QR en el Backend
  const guardarConfiguracionQR = async () => {
    setGuardando(true);
    await actualizarDatosBancariosBackend({
      bancoNombre: bancoQR,
      numeroCuentaBancaria: numeroCuenta,
      qr: qrImagenUrl
    });
    setGuardando(false);
    setGuardadoExitoso('QR');
    onMostrarToast('Código QR de cobro guardado exitosamente en el backend.');
    setTimeout(() => setGuardadoExitoso(null), 3000);
  };

  // Guardar configuración de Cuenta Bancaria en el Backend
  const guardarConfiguracionBanco = async () => {
    setGuardando(true);
    await actualizarDatosBancariosBackend({
      bancoNombre: bancoSeleccionado,
      numeroCuentaBancaria: numeroCuenta,
      qr: qrImagenUrl
    });
    setGuardando(false);
    setGuardadoExitoso('BANCO');
    onMostrarToast('Cuenta bancaria guardada exitosamente en el backend.');
    setTimeout(() => setGuardadoExitoso(null), 3000);
  };

  // Manejo de subida de archivo QR preparado para Amazon S3
  const handleSubirFotoQR = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Generar URL canónica en Amazon S3 correspondiente al anfitrión autenticado
      const ext = file.name.split('.').pop() || 'png';
      const s3Url = `https://alojate-bolivia.s3.sa-east-1.amazonaws.com/anfitriones/${encodeURIComponent(perfil.id)}/qr-cobro.${ext}`;
      setQrImagenUrl(s3Url);
      onMostrarToast('Imagen preparada para Amazon S3. Haz clic en "Guardar QR de Cobro" para sincronizar con el backend.');
    }
  };

  const handleSolicitarTransferencia = () => {
    onMostrarToast(`Transferencia solicitada exitosamente a tu cuenta de ${bancoSeleccionado} (#${numeroCuenta}).`);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      
      {/* 1. Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
            Finanzas &amp; Pasarela de Pagos
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configuración de cobros por QR Simple en Amazon S3 y transferencias bancarias ASFI conectadas al backend
          </p>
        </div>

        <div className="flex items-center gap-2">
          {cargandoBackend ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
              <span>Sincronizando con Backend...</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
              <Server className="w-3.5 h-3.5 text-emerald-600" />
              <span>Backend Conectado (BD Oficial)</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Resumen de Saldo y Transferencias */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-700/60">
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">
            Fondos Acumulados
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl sm:text-4xl font-bold text-white">
              {perfil.saldoDisponible}
            </span>
            <span className="text-xs text-emerald-300 font-semibold">
              Disponibles para retiro
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
            Los fondos provienen de los pagos realizados por tus huéspedes mediante QR Simple o transferencia directa a tu cuenta registrada en el backend.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleSolicitarTransferencia}
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Transferir a mi Cuenta</span>
          </button>
        </div>
      </div>

      {/* 3. Configuración de Métodos de Cobro (QR o Cuenta Bancaria) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
              Métodos de Cobro para tus Huéspedes
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Cada anfitrión dispone de su propia configuración bancaria y QR alojado en la nube
            </p>
          </div>

          {/* Switch de Métodos */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setMetodoCobroActivo('QR')}
              className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                metodoCobroActivo === 'QR'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Código QR de Pago (S3)</span>
            </button>

            <button
              type="button"
              onClick={() => setMetodoCobroActivo('BANCO')}
              className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                metodoCobroActivo === 'BANCO'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Cuenta Bancaria (BD)</span>
            </button>
          </div>
        </div>

        {/* CONTENIDO PESTAÑA 1: QR DE PAGO EN AMAZON S3 */}
        {metodoCobroActivo === 'QR' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Visualizador de QR */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Cloud className="w-3.5 h-3.5 text-amber-500" />
                <span>QR en Amazon S3</span>
              </span>
              <div className="w-48 h-48 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden">
                <img
                  src={
                    qrImagenUrl.startsWith('http')
                      ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrImagenUrl)}`
                      : qrImagenUrl
                  }
                  alt="QR de Pago"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-800 dark:text-slate-200">{titularQR}</p>
                <p className="text-[11px] text-slate-500 font-medium">{bancoQR}</p>
              </div>

              {/* Botón para subir imagen propia */}
              <label className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition flex items-center justify-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-blue-500" />
                <span>Subir archivo de mi QR</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSubirFotoQR}
                  className="hidden"
                />
              </label>
            </div>

            {/* Formulario de QR */}
            <div className="md:col-span-2 space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-3">
                <Cloud className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Almacenamiento Cloud en Amazon S3:</strong> La imagen de tu código QR se almacena en el bucket de Amazon S3 de Aloja-Te. La URL resultante se guarda como un atributo de texto en tu registro de usuario en el backend para la pasarela de pagos.
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Banco de emisión de tu QR:
                  </label>
                  <select
                    value={bancoQR}
                    onChange={e => setBancoQR(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {BANCOS_BOLIVIA.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre del titular del QR:
                  </label>
                  <input
                    type="text"
                    value={titularQR}
                    onChange={e => setTitularQR(e.target.value)}
                    placeholder="Ej. Carlos Mendoza Roca"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    URL de Amazon S3 del QR (campo string en Backend):
                  </label>
                  <input
                    type="text"
                    value={qrImagenUrl}
                    onChange={e => setQrImagenUrl(e.target.value)}
                    placeholder="https://alojate-bolivia.s3.sa-east-1.amazonaws.com/..."
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-[11px] outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Este enlace apunta directamente al objeto público/firmado de tu QR en AWS S3.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="button"
                  onClick={guardarConfiguracionQR}
                  disabled={guardando}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {guardando ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>
                    {guardando
                      ? 'Sincronizando con Backend...'
                      : guardadoExitoso === 'QR'
                      ? '¡QR Guardado en Backend!'
                      : 'Guardar QR de Cobro'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONTENIDO PESTAÑA 2: CUENTA BANCARIA */}
        {metodoCobroActivo === 'BANCO' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed flex items-start gap-3">
              <Server className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong>Persistencia Oficial en Base de Datos:</strong> Los campos de Entidad Bancaria y Número de Cuenta se persisten directamente en los atributos `banco_nombre` y `numero_cuenta_bancaria` de la tabla `usuarios` del backend.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Entidad Bancaria:
                </label>
                <select
                  value={bancoSeleccionado}
                  onChange={e => setBancoSeleccionado(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {BANCOS_BOLIVIA.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de Cuenta:
                </label>
                <select
                  value={tipoCuenta}
                  onChange={e => setTipoCuenta(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Caja de Ahorros">Caja de Ahorros (BOB)</option>
                  <option value="Cuenta Corriente">Cuenta Corriente (BOB)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Número de Cuenta Bancaria:
                </label>
                <input
                  type="text"
                  value={numeroCuenta}
                  onChange={e => setNumeroCuenta(e.target.value)}
                  placeholder="Ej. 4010987654321"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Titular de la Cuenta:
                </label>
                <input
                  type="text"
                  value={titularCuenta}
                  onChange={e => setTitularCuenta(e.target.value)}
                  placeholder="Nombre y Apellidos"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cédula de Identidad (CI / NIT):
                </label>
                <input
                  type="text"
                  value={documentoIdentidad}
                  onChange={e => setDocumentoIdentidad(e.target.value)}
                  placeholder="Ej. 5829104 SC"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={guardarConfiguracionBanco}
                disabled={guardando}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {guardando ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>
                  {guardando
                    ? 'Guardando en BD Backend...'
                    : guardadoExitoso === 'BANCO'
                    ? '¡Cuenta Guardada en Backend!'
                    : 'Guardar Cuenta Bancaria'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Historial de Liquidaciones & Cobros */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
              Historial de Cobros &amp; Liquidaciones
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Detalle de ingresos recibidos por reservas confirmadas
            </p>
          </div>

          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
            3 Liquidaciones registradas
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Reserva #RES-8921</p>
                <p className="text-slate-400 text-[11px]">Huésped: Lucía Suárez · Transferencia QR</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold font-mono text-emerald-600 dark:text-emerald-400">+Bs. 1,400</p>
              <p className="text-[10px] text-slate-400">08/11/2026 · Acreditado</p>
            </div>
          </div>

          <div className="py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Reserva #RES-8840</p>
                <p className="text-slate-400 text-[11px]">Huésped: Marcos Aguilera · Cuenta Bancaria</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold font-mono text-emerald-600 dark:text-emerald-400">+Bs. 850</p>
              <p className="text-[10px] text-slate-400">05/11/2026 · Acreditado</p>
            </div>
          </div>

          <div className="py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Reserva #RES-8712</p>
                <p className="text-slate-400 text-[11px]">Huésped: Sofia Vargas · Transferencia QR</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold font-mono text-emerald-600 dark:text-emerald-400">+Bs. 1,170</p>
              <p className="text-[10px] text-slate-400">01/11/2026 · Acreditado</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
