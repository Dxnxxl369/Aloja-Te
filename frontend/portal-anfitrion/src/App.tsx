import React, { useState, useEffect } from 'react';
import { SidebarLateral } from './shared/layout/SidebarLateral';
import { TopHeader } from './shared/layout/TopHeader';
import { TableroEjecutivo } from './features/dashboard/components/TableroEjecutivo';
import { ListaAlojamientos } from './features/alojamientos/components/ListaAlojamientos';
import { RecepcionPinControl } from './features/recepcion/components/RecepcionPinControl';
import { LiquidacionesBNB } from './features/finanzas/components/LiquidacionesBNB';
import { ReportesGenerativosIA } from './features/reportes/components/ReportesGenerativosIA';
import { useAnfitrionAuth } from './core/auth/AuthContext';
import { alojamientoService } from './features/alojamientos/services/alojamientoService';
import { Alojamiento } from './core/types/anfitrion.types';
import { CheckCircle2 } from 'lucide-react';

export const AppContent: React.FC = () => {
  const { anfitrionClave } = useAnfitrionAuth();
  
  // Estado de sección activa
  const [seccionActiva, setSeccionActiva] = useState<string>('dashboard');
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  
  // Lista reactiva de alojamientos según el anfitrión activo
  const [alojamientos, setAlojamientos] = useState<Alojamiento[]>(() =>
    alojamientoService.obtenerPorAnfitrion(anfitrionClave)
  );

  // Toast flotante
  const [toastMensaje, setToastMensaje] = useState<string | null>(null);

  // Recargar alojamientos cuando el anfitrión cambia (Carlos vs Elena)
  useEffect(() => {
    setAlojamientos(alojamientoService.obtenerPorAnfitrion(anfitrionClave));
  }, [anfitrionClave]);

  const handleGuardarAlojamientos = (nuevaLista: Alojamiento[]) => {
    setAlojamientos(nuevaLista);
    alojamientoService.guardar(anfitrionClave, nuevaLista);
  };

  const mostrarToast = (mensaje: string) => {
    setToastMensaje(mensaje);
    setTimeout(() => {
      setToastMensaje(null);
    }, 3500);
  };

  const conteoPendientes = alojamientos.filter(a => a.estadoOperativo === 'PENDIENTE').length;

  // Título y subtítulo dinámico
  const getHeaderInfo = () => {
    switch (seccionActiva) {
      case 'dashboard':
        return {
          titulo: 'Tablero de Control del Anfitrión',
          subtitulo: 'Supervisión en tiempo real de reservas, disponibilidad y check-in de huéspedes'
        };
      case 'alojamientos':
        return {
          titulo: 'Mis Alojamientos & Habitaciones',
          subtitulo: 'Gestión hotelera, inventario de suites y galería fotográfica independiente'
        };
      case 'recepcion':
        return {
          titulo: 'Recepción & Control de Llaves por PIN',
          subtitulo: 'Operación hotelera y estados en tiempo real (Libre, Pendiente de PIN, En Uso)'
        };
      case 'finanzas':
        return {
          titulo: 'Liquidaciones & Cobros Bancarios BNB',
          subtitulo: 'Abonos directos a cuenta bancaria y trazabilidad de pagos QR Simple BNB'
        };
      case 'reportes':
        return {
          titulo: 'Reportes Generativos con Inteligencia Artificial',
          subtitulo: 'Consultas en lenguaje natural, reordenamiento interactivo y exportación optimizada para Excel'
        };
      default:
        return {
          titulo: 'Panel del Anfitrión',
          subtitulo: 'Aloja-Te Gestión Hotelera'
        };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100">
      
      {/* Sidebar Lateral Fijo */}
      <SidebarLateral
        seccionActiva={seccionActiva}
        onCambiarSeccion={(s) => {
          setSeccionActiva(s);
          setMenuMovilAbierto(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        conteoPendientes={conteoPendientes}
        conteoAlojamientos={alojamientos.length}
        menuMovilAbierto={menuMovilAbierto}
        onCerrarMenuMovil={() => setMenuMovilAbierto(false)}
      />

      {/* Área Principal de Contenido (a la derecha del Sidebar) */}
      <div className="flex-1 lg:ml-72 flex flex-col min-w-0">
        
        {/* Cabecera Superior Fija */}
        <TopHeader
          titulo={headerInfo.titulo}
          subtitulo={headerInfo.subtitulo}
          onAbrirMenuMovil={() => setMenuMovilAbierto(true)}
          onAbrirValidarPin={() => setSeccionActiva('recepcion')}
          onPublicarPropiedad={() => {
            setSeccionActiva('alojamientos');
            mostrarToast('Asistente de registro disponible en Mis Alojamientos.');
          }}
        />

        {/* Cuerpo de la Sección Activa */}
        <main className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 flex-1">
          {seccionActiva === 'dashboard' && (
            <TableroEjecutivo
              alojamientos={alojamientos}
              onIrARecepcion={() => setSeccionActiva('recepcion')}
              onIrAAlojamientos={() => setSeccionActiva('alojamientos')}
              onValidarPinUnidad={() => setSeccionActiva('recepcion')}
              onCheckoutUnidad={() => setSeccionActiva('recepcion')}
            />
          )}

          {seccionActiva === 'alojamientos' && (
            <ListaAlojamientos
              alojamientos={alojamientos}
              onGuardarLista={(nuevaLista) => {
                handleGuardarAlojamientos(nuevaLista);
                mostrarToast('Alojamiento y habitaciones guardados exitosamente.');
              }}
              onPublicarNuevo={() => {
                mostrarToast('Para publicar una nueva propiedad pulsa en Añadir Habitación.');
              }}
            />
          )}

          {seccionActiva === 'recepcion' && (
            <RecepcionPinControl
              alojamientos={alojamientos}
              onActualizarAlojamientos={handleGuardarAlojamientos}
              onMostrarToast={mostrarToast}
            />
          )}

          {seccionActiva === 'finanzas' && (
            <LiquidacionesBNB onMostrarToast={mostrarToast} />
          )}

          {seccionActiva === 'reportes' && (
            <ReportesGenerativosIA
              alojamientos={alojamientos}
              onMostrarToast={mostrarToast}
            />
          )}
        </main>
      </div>

      {/* Toast Flotante */}
      {toastMensaje && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl border border-slate-800 dark:border-slate-200 flex items-center gap-3 text-xs font-semibold animate-fade-in">
          <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span>{toastMensaje}</span>
        </div>
      )}

    </div>
  );
};
