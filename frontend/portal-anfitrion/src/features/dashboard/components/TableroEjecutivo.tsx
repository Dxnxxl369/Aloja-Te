import React from 'react';
import { useAnfitrionAuth } from '../../../core/auth/AuthContext';
import { Alojamiento } from '../../../core/types/anfitrion.types';
import {
  ArrowUpRight,
  Wallet,
  BedDouble,
  Users,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  Sun,
  KeyRound,
  LogOut,
  MapPin,
  Building
} from 'lucide-react';

interface TableroEjecutivoProps {
  alojamientos: Alojamiento[];
  onIrARecepcion: () => void;
  onIrAAlojamientos: () => void;
  onValidarPinUnidad: (idAlojamiento: string) => void;
  onCheckoutUnidad: (idAlojamiento: string) => void;
}

export const TableroEjecutivo: React.FC<TableroEjecutivoProps> = ({
  alojamientos,
  onIrARecepcion,
  onIrAAlojamientos,
  onValidarPinUnidad,
  onCheckoutUnidad
}) => {
  const { perfil } = useAnfitrionAuth();

  const enUso = alojamientos.filter(a => a.estadoOperativo === 'EN_USO').length;
  const pendientes = alojamientos.filter(a => a.estadoOperativo === 'PENDIENTE').length;
  const libres = alojamientos.filter(a => a.estadoOperativo === 'LIBRE').length;
  const total = alojamientos.length || 1;

  const pctUso = Math.round((enUso / total) * 100);
  const pctPendiente = Math.round((pendientes / total) * 100);
  const pctLibre = Math.max(0, 100 - pctUso - pctPendiente);

  // Eventos activos hoy (salidas o llegadas)
  const eventosHoy = alojamientos.filter(
    a => a.estadoOperativo === 'PENDIENTE' || a.estadoOperativo === 'EN_USO'
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* 1. Header con vida y atmósfera ejecutiva */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl relative overflow-hidden border border-slate-700/60">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Panel de Control en Vivo
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-slate-300 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-md">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                {perfil.ciudad}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                <Sun className="w-3.5 h-3.5" />
                27°C · Alta demanda turística
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
              Hola, {perfil.nombre.split(' ')[0]}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Hoy tienes <strong className="text-white underline decoration-rose-400 decoration-2">{enUso} salidas</strong> y <strong className="text-white underline decoration-amber-400 decoration-2">{pendientes} llegadas</strong> programadas en tus {alojamientos.length} propiedades.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
            <button
              type="button"
              onClick={onIrARecepcion}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/30 transition flex items-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Recepción &amp; PINs</span>
            </button>
          </div>
        </div>

        {/* Círculos decorativos de fondo para profundidad visual */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-16 w-60 h-60 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Cuadrícula de 4 KPIs con vida, color y métricas útiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Ingresos del Mes */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-emerald-100 dark:border-emerald-950/60 shadow-xs hover:border-emerald-300 transition group relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Ingresos del Mes</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition shadow-xs">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-bold text-slate-900 dark:text-white">
              Bs. {perfil.kpis.ingresosNetos}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +12% vs mes anterior
            </span>
            <span className="text-slate-400 font-mono text-[10px]">Abono interbancario</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-80" />
        </div>

        {/* KPI 2: Tasa de Ocupación */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-blue-100 dark:border-blue-950/60 shadow-xs hover:border-blue-300 transition group relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Tasa de Ocupación</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition shadow-xs">
              <BedDouble className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-bold text-slate-900 dark:text-white">
              {perfil.kpis.tasaOcupacion}
            </span>
            <span className="text-xs text-slate-400 font-medium">promedio</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Alta temporada
            </span>
            <span className="text-slate-400 text-[10px]">26 de 30 noches</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-80" />
        </div>

        {/* KPI 3: Huéspedes Activos */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-amber-100 dark:border-amber-950/60 shadow-xs hover:border-amber-300 transition group relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Huéspedes Activos</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition shadow-xs">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-bold text-slate-900 dark:text-white">
              {enUso} en estadía
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              PINs validados
            </span>
            <span className="text-slate-400 text-[10px]">{libres} libre</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-400 opacity-80" />
        </div>

        {/* KPI 4: Liquidaciones BNB */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-indigo-100 dark:border-indigo-950/60 shadow-xs hover:border-indigo-300 transition group relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Saldo por Liquidar</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition shadow-xs">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-bold text-slate-900 dark:text-white">
              {perfil.saldoDisponible}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-indigo-600 dark:text-indigo-400 font-medium">
              Abono programado
            </span>
            <span className="text-slate-400 text-[10px]">Todos los bancos</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-80" />
        </div>

      </div>

      {/* 3. Dos Columnas Operativas: Agenda con Vida + Estado Operativo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Izquierda (2/3): Agenda Cronológica de Hoy */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Agenda de Operaciones de Hoy
              </h2>
            </div>
            <button
              type="button"
              onClick={onIrARecepcion}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 transition"
            >
              <span>Ver todas en Recepción</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {eventosHoy.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <Calendar className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
              <p>No tienes salidas ni llegadas pendientes para el día de hoy.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {eventosHoy.map((a, idx) => {
                const reserva = a.reservas?.[0];
                const isSalida = a.estadoOperativo === 'EN_USO';
                const horaMock = idx === 0 ? '11:00' : '14:00';
                const fotoAlojamiento = a.fotografias?.[0]?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80';

                return (
                  <div
                    key={a.idAlojamiento}
                    className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Miniatura del alojamiento */}
                      <img
                        src={fotoAlojamiento}
                        alt={a.titulo}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-xs"
                      />

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200">
                            {horaMock}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              isSalida
                                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40'
                                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40'
                            }`}
                          >
                            {isSalida ? '● Salida' : '● Llegada'}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {a.ciudad}
                          </span>
                        </div>

                        <div className="mt-0.5 truncate">
                          <span className="font-semibold text-xs text-slate-900 dark:text-white">
                            {reserva?.huespedNombre || 'Huésped Registrado'}
                          </span>
                          <span className="text-slate-400 text-xs ml-1.5 truncate">
                            — {a.titulo}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      {isSalida ? (
                        <button
                          type="button"
                          onClick={() => onCheckoutUnidad(a.idAlojamiento)}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <LogOut className="w-3.5 h-3.5 text-slate-500" />
                          <span>Registrar salida</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onValidarPinUnidad(a.idAlojamiento)}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-amber-500/20"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Registrar ingreso</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Derecha (1/3): Barra Segmentada de Estado Operativo */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Estado del Inventario
              </h2>
              <span className="text-[11px] font-mono text-slate-400">
                {alojamientos.length} unidades
              </span>
            </div>

            {/* Barra segmentada con fill vibrante */}
            <div className="space-y-2">
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                <div
                  style={{ width: `${pctUso}%` }}
                  className="bg-emerald-500 h-full transition-all duration-500"
                  title={`${enUso} En uso (${pctUso}%)`}
                />
                <div
                  style={{ width: `${pctPendiente}%` }}
                  className="bg-amber-400 h-full transition-all duration-500"
                  title={`${pendientes} Pendiente (${pctPendiente}%)`}
                />
                <div
                  style={{ width: `${pctLibre}%` }}
                  className="bg-slate-300 dark:bg-slate-700 h-full transition-all duration-500"
                  title={`${libres} Libre (${pctLibre}%)`}
                />
              </div>

              {/* Leyenda limpia y colorida */}
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
                  <strong className="text-slate-900 dark:text-white">{enUso}</strong> En uso
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-xs" />
                  <strong className="text-slate-900 dark:text-white">{pendientes}</strong> Pendiente
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600 shadow-xs" />
                  <strong className="text-slate-900 dark:text-white">{libres}</strong> Libre
                </span>
              </div>
            </div>

            {/* Tarjetas de estado rápido */}
            <div className="space-y-2 pt-2 text-xs">
              <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/40 flex items-center justify-between">
                <span className="font-medium text-emerald-900 dark:text-emerald-200">
                  Ocupación activa
                </span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                  {pctUso}% del total
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Disponibles hoy
                </span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  {libres} alojamientos
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onIrAAlojamientos}
              className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Gestionar Alojamientos &amp; Tarifas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};