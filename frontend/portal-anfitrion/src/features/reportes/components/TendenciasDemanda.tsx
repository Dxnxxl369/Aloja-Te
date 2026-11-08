import React from 'react';
import { FileText, Sparkles, TrendingUp, Award, Star } from 'lucide-react';

interface TendenciasDemandaProps {
  onMostrarToast: (msg: string) => void;
}

export const TendenciasDemanda: React.FC<TendenciasDemandaProps> = ({ onMostrarToast }) => {
  const descargarReporte = () => {
    onMostrarToast('Generando informe ejecutivo de ocupación y tarifas en formato PDF...');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
            Tendencias de Demanda &amp; Opiniones
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Información estratégica del mercado turístico boliviano y satisfacción de tus huéspedes
          </p>
        </div>

        <button
          type="button"
          onClick={descargarReporte}
          className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-blue-400 text-xs font-bold transition flex items-center gap-2 shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <FileText className="w-4 h-4 text-blue-500" />
          <span>Descargar Informe Mensual (PDF)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Columna 1 y 2: Calendario de Demanda Turística */}
        <div className="md:col-span-2 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
          <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Temporadas Altas Proyectadas en Bolivia</span>
          </h3>

          <div className="space-y-3.5 text-xs">
            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 space-y-1.5">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-blue-900 dark:text-blue-300">
                  Semana Santa &amp; Feriados Nacionales
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                  Alta Demanda Prevista
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Se proyecta un incremento del 35% en solicitudes de hospedaje para Santa Cruz y Samaipata. Te recomendamos revisar tarifas base con antelación para optimizar tus ingresos netos.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 space-y-1.5">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-amber-900 dark:text-amber-300">
                  Vendimia Chapaca (Valle Central de Tarija)
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-bold">
                  Ocupación al 95%
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Hospedajes de campo y viñedos registran reservas con hasta 45 días de anticipación. Mantén actualizados los calendarios y habitaciones disponibles.
              </p>
            </div>
          </div>
        </div>

        {/* Columna 3: Calidad Percibida por Huéspedes */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
          <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-500" />
            <span>Calidad Percibida</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Limpieza &amp; Habitabilidad</span>
                <span className="text-blue-600 font-bold">4.9 / 5.0</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '98%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Atención &amp; Entrega de Llaves</span>
                <span className="text-blue-600 font-bold">5.0 / 5.0</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Ubicación &amp; Seguridad</span>
                <span className="text-blue-600 font-bold">4.8 / 5.0</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '96%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Relación Calidad - Precio</span>
                <span className="text-blue-600 font-bold">4.9 / 5.0</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '98%' }} />
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
