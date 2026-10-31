import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface ImageLightboxModalProps {
  isOpen: boolean;
  imagenes: string[];
  indiceInicial?: number;
  titulo?: string;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  imagenes,
  indiceInicial = 0,
  titulo = 'Fotografías del Alojamiento',
  onClose,
}) => {
  const [indiceActual, setIndiceActual] = React.useState(indiceInicial);

  useEffect(() => {
    setIndiceActual(indiceInicial);
  }, [indiceInicial, isOpen]);

  const anterior = useCallback(() => {
    setIndiceActual((prev) => (prev > 0 ? prev - 1 : imagenes.length - 1));
  }, [imagenes.length]);

  const siguiente = useCallback(() => {
    setIndiceActual((prev) => (prev < imagenes.length - 1 ? prev + 1 : 0));
  }, [imagenes.length]);

  // Soporte de navegación por teclado
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') anterior();
      if (e.key === 'ArrowRight') siguiente();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, anterior, siguiente, onClose]);

  if (!isOpen || !imagenes || imagenes.length === 0) return null;

  const imagenActiva = imagenes[indiceActual] || imagenes[0];

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col justify-between p-4 sm:p-6 bg-slate-900/95 dark:bg-black/95 backdrop-blur-2xl animate-fade-in text-white select-none"
      onClick={onClose}
    >
      {/* Header Superior */}
      <div
        className="flex items-center justify-between z-10 w-full max-w-6xl mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-base sm:text-lg font-bold text-white leading-tight">
              {titulo}
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Fotografía {indiceActual + 1} de {imagenes.length}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition border border-white/10 flex items-center gap-1.5 text-xs font-semibold"
          title="Cerrar vista (Esc)"
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">Cerrar (Esc)</span>
        </button>
      </div>

      {/* Visor Central con Botones Laterales */}
      <div
        className="relative flex-1 flex items-center justify-center my-4 max-w-6xl w-full mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón Anterior */}
        {imagenes.length > 1 && (
          <button
            onClick={anterior}
            className="absolute left-2 sm:left-4 z-20 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-blue-600/90 text-white transition backdrop-blur-md border border-white/20 shadow-xl hover:scale-110 active:scale-95"
            title="Anterior (Flecha izquierda)"
          >
            <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        )}

        {/* Imagen en Alta Resolución */}
        <div className="relative max-h-[68vh] max-w-full flex items-center justify-center overflow-hidden rounded-3xl shadow-2xl border border-white/15 bg-black/40">
          <img
            src={imagenActiva}
            alt={`${titulo} - Foto ${indiceActual + 1}`}
            className="max-h-[68vh] max-w-full object-contain rounded-3xl transition-all duration-300 transform scale-100"
          />
        </div>

        {/* Botón Siguiente */}
        {imagenes.length > 1 && (
          <button
            onClick={siguiente}
            className="absolute right-2 sm:right-4 z-20 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-blue-600/90 text-white transition backdrop-blur-md border border-white/20 shadow-xl hover:scale-110 active:scale-95"
            title="Siguiente (Flecha derecha)"
          >
            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        )}
      </div>

      {/* Tira de Miniaturas Inferior */}
      {imagenes.length > 1 && (
        <div
          className="z-10 w-full max-w-3xl mx-auto overflow-x-auto py-2 px-4 flex items-center justify-center gap-2 sm:gap-3 scrollbar-thin scrollbar-thumb-white/20"
          onClick={(e) => e.stopPropagation()}
        >
          {imagenes.map((img, idx) => {
            const esActiva = idx === indiceActual;
            return (
              <button
                key={idx}
                onClick={() => setIndiceActual(idx)}
                className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 transition-all border-2 ${
                  esActiva
                    ? 'border-blue-500 scale-105 shadow-lg shadow-blue-500/40 opacity-100 ring-2 ring-blue-400/50'
                    : 'border-white/20 opacity-50 hover:opacity-85 hover:border-white/50'
                }`}
              >
                <img
                  src={img}
                  alt={`Miniatura ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
