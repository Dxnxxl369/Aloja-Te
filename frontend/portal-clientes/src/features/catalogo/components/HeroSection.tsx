import React from 'react';
import { Search, MapPin, Calendar, Users, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onSearch: (query: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
  return (
    <div className="relative pt-10 pb-16 overflow-hidden">
      {/* Decorative blurred background shapes - Blue & Indigo */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Subtitle Badge - Royal Blue */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold mb-6 tracking-wide shadow-sm animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>HOSPITALIDAD &amp; PATRIMONIO DE BOLIVIA</span>
        </div>

        {/* Playfair Display Title */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.15] max-w-4xl mx-auto mb-6">
          Descubre el encanto de alojarte en los rincones más <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500">auténticos</span> de nuestro país
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Desde cabañas rústicas en la Chiquitanía y viñedos en Tarija, hasta refugios andinos con vistas al Illimani. Reservas protegidas y pagos seguros con QR Simple.
        </p>

        {/* Liquid Glass Search Bar */}
        <div className="max-w-4xl mx-auto p-3 sm:p-4 rounded-3xl liquid-glass shadow-2xl border border-slate-200/80 dark:border-slate-800 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            
            {/* Ubicación */}
            <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Destino</span>
                <input
                  type="text"
                  placeholder="¿A dónde viajas?"
                  onChange={(e) => onSearch(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none w-full"
                />
              </div>
            </div>

            {/* Fechas */}
            <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Estadía</span>
                <span className="block text-xs font-semibold text-slate-900 dark:text-white truncate">Noviembre 2026</span>
              </div>
            </div>

            {/* Huéspedes */}
            <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Viajeros</span>
                <span className="block text-xs font-semibold text-slate-900 dark:text-white">2 - 4 Huéspedes</span>
              </div>
            </div>

            {/* Botón Buscar */}
            <button
              onClick={() => onSearch('')}
              className="w-full h-full min-h-[48px] rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition active:scale-[0.98]"
            >
              <Search className="w-4 h-4" />
              <span>Explorar Alojamientos</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
