import React from 'react';
import { Sun, Heart, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-500 dark:text-slate-400 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/25">
                <Sun className="w-4 h-4" />
              </div>
              <span className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                Aloja-Te Bolivia
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Plataforma digital nacional de alojamientos con cobertura en los 9 departamentos. Orgullosamente boliviana.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3">Destinos Destacados</h5>
            <ul className="space-y-1.5">
              <li>Chiquitanía &amp; San Javier (Santa Cruz)</li>
              <li>Valle de la Concepción (Tarija)</li>
              <li>Mirador del Illimani (La Paz)</li>
              <li>Samaipata &amp; Amboró (Santa Cruz)</li>
              <li>Torotoro &amp; Valle Alto (Cochabamba)</li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-stone-900 dark:text-white uppercase tracking-wider text-[11px] mb-3">Seguridad &amp; Pagos</h5>
            <ul className="space-y-1.5">
              <li>QR Simple oficial (Banco BNB)</li>
              <li>Facturación Computarizada SIN</li>
              <li>PIN confidencial de Check-in</li>
              <li>Garantía de disponibilidad inmediata</li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-stone-900 dark:text-white uppercase tracking-wider text-[11px] mb-3">Atención &amp; Confianza</h5>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed mb-3">
              Asistencia personalizada a viajeros y anfitriones en todo el territorio boliviano. Transparencia, hospitalidad y protección en cada reserva.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              <Shield className="w-3.5 h-3.5" />
              <span>Plataforma Oficial Verificada</span>
            </div>
          </div>

        </div>

        <div className="pt-6 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <span>© 2026 Aloja-Te Bolivia • Todos los derechos reservados.</span>
          <span className="flex items-center gap-1">
            Diseñado con <Heart className="w-3 h-3 text-red-500 fill-red-500" /> en Santa Cruz de la Sierra, Bolivia.
          </span>
        </div>
      </div>
    </footer>
  );
};
