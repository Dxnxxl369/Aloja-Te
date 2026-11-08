import React from 'react';

interface AnfitrionVerificadoBadgeProps {
  nombre?: string;
  tamano?: 'sm' | 'md' | 'lg';
  mostrarTexto?: boolean;
  textoPersonalizado?: string;
  className?: string;
}

export const AnfitrionVerificadoBadge: React.FC<AnfitrionVerificadoBadgeProps> = ({
  nombre,
  tamano = 'sm',
  mostrarTexto = true,
  textoPersonalizado,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  const badgeText = textoPersonalizado || (tamano === 'sm' ? 'Verificado' : 'Anfitrión Verificado');

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50/90 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 font-bold border border-blue-200/80 dark:border-blue-800 shadow-sm cursor-help transition-all hover:bg-blue-100 dark:hover:bg-blue-900/80 select-none ${textSizes[tamano]} ${className}`}
      title={
        nombre
          ? `${nombre} cuenta con verificación oficial de Cédula de Identidad, número de contacto y acreditación legal ante Aloja-Te.`
          : 'Anfitrión con Cédula de Identidad, teléfono y documentación turística validada por auditoría.'
      }
    >
      {/* Insignia Azul Estilo Verificado (Roseta / Check Circular) */}
      <svg
        className={`${iconSizes[tamano]} text-blue-600 dark:text-blue-400 shrink-0 fill-current drop-shadow-[0_1px_1px_rgba(37,99,235,0.25)]`}
        viewBox="0 0 24 24"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.2 14.2l-4-4 1.41-1.41L10.8 13.38l6.79-6.79 1.41 1.41-8.2 8.2z" />
      </svg>

      {mostrarTexto && <span className="tracking-tight">{badgeText}</span>}
    </span>
  );
};
