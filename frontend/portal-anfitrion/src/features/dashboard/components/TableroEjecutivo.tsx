import React from 'react';
import {
  Banknote,
  CalendarCheck,
  Users,
  Star,
  CheckCircle,
  ArrowUpRight,
  Activity,
  KeyRound,
  PieChart,
  Sliders,
  LogOut
} from 'lucide-react';
import { useAnfitrionAuth } from '../../../core/auth/AuthContext';
import { Alojamiento } from '../../../core/types/anfitrion.types';

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

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Banner de Bienvenida con Insignia Acreditada */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-xl shadow-blue-950/20 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-[10px] font-bold tracking-wide uppercase border border-blue-400/30">
              Panel Oficial de Anfitrión
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-200">
              <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>Acreditación Turística Legal Vigente</span>
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
            Bienvenido, {perfil.nombre.split(' ')[0]}
          </h1>
          <p className="text-xs text-blue-100/80 max-w-xl leading-relaxed">
            {perfil.descripcion} Tus reservas cuentan con cobros automáticos mediante QR Simple BNB y recepción de huéspedes con PIN de 6 dígitos.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 self-start md:self-auto">
          <button
            type="button"
            onClick={onIrARecepcion}
            className="px-4 py-2.5 rounded-2xl bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs shadow-md transition flex items-center gap-2"
          >
            <KeyRound className="w-4 h-4 text-blue-700" />
            <span>Ver Llegadas de Hoy</span>
          </button>
        </div>

        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Cuadrícula de KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Ingresos Netos (Mes)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
              {perfil.kpis.ingresosNetos}
            </span>
            <span className="text-xs text-slate-400 font-semibold">BOB</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Acreditado en cuenta BNB</span>
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Tasa de Ocupación</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
              {perfil.kpis.tasaOcupacion}
            </span>
            <span className="text-xs text-slate-400 font-semibold">promedio</span>
          </div>
          <p className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
            <Activity className="w-3.5 h-3.5" />
            <span>26 de 30 noches ocupadas</span>
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Hospedados en Curso</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
              {enUso} Activos
            </span>
            <span className="text-xs text-slate-400 font-semibold">en uso</span>
          </div>
          <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>PIN validado al ingreso</span>
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Reputación Hotelera</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
              {perfil.kpis.reputacion}
            </span>
            <span className="text-xs text-slate-400 font-semibold">Excelente</span>
          </div>
          <p className="text-[11px] text-indigo-600 font-medium flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Recomendado por 98% de viajeros</span>
          </p>
        </div>

      </div>

      {/* Bloque Doble: Recepción Express + Estado Operativo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda (2 cols): Llegadas de Hoy */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                Recepción de Hoy &amp; Control de Llaves
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Propiedades reservadas y entrega de llaves mediante código PIN de 6 dígitos
              </p>
            </div>
            <button
              type="button"
              onClick={onIrARecepcion}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Ver todas las recepciones</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {alojamientos.filter(a => a.estadoOperativo === 'PENDIENTE' || a.estadoOperativo === 'EN_USO').map(a => {
              const reservaActiva = a.reservas?.[0];
              const isPendiente = a.estadoOperativo === 'PENDIENTE';

              return (
                <div
                  key={a.idAlojamiento}
                  className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-blue-400 transition"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={a.fotografias[0]?.url}
                      alt={a.titulo}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                          {a.titulo}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            isPendiente
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {isPendiente ? '🟡 Pendiente de PIN' : '🟢 En Uso'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Huésped: <strong className="text-slate-800 dark:text-slate-200">{reservaActiva?.huespedNombre || 'Viajero Registrado'}</strong> • {reservaActiva?.desde || ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {isPendiente ? (
                      <button
                        type="button"
                        onClick={() => onValidarPinUnidad(a.idAlojamiento)}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Ingresar PIN</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onCheckoutUnidad(a.idAlojamiento)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Registrar Salida</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Columna Derecha (1 col): Estado Operativo */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                Estado Operativo
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Resumen de inventario en tiempo real
              </p>
            </div>
            <PieChart className="w-5 h-5 text-slate-400" />
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-bold text-slate-800 dark:text-slate-200">En Uso (Hospedados)</span>
              </div>
              <span className="font-bold font-mono text-emerald-700 dark:text-emerald-300">
                {enUso} Propiedades
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="font-bold text-slate-800 dark:text-slate-200">Pendiente de PIN</span>
              </div>
              <span className="font-bold font-mono text-amber-700 dark:text-amber-300">
                {pendientes} Reservas
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span className="font-bold text-slate-800 dark:text-slate-200">Libres (Disponibles)</span>
              </div>
              <span className="font-bold font-mono text-slate-600 dark:text-slate-300">
                {libres} Propiedad
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onIrAAlojamientos}
              className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Administrar Alojamientos &amp; Tarifas</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
