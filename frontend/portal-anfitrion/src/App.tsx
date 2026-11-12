import React, { useState, useEffect } from 'react';
import { SidebarLateral } from './shared/layout/SidebarLateral';
import { TopHeader } from './shared/layout/TopHeader';
import { TableroEjecutivo } from './features/dashboard/components/TableroEjecutivo';
import { ListaAlojamientos } from './features/alojamientos/components/ListaAlojamientos';
import { RecepcionPinControl } from './features/recepcion/components/RecepcionPinControl';
import { LiquidacionesBNB } from './features/finanzas/components/LiquidacionesBNB';
import { ReportesGenerativosIA } from './features/reportes/components/ReportesGenerativosIA';
import { MiPerfilScreen } from './features/perfil/components/MiPerfilScreen';
import { ListingWizardModal } from './features/alojamientos/modals/ListingWizardModal';
import { useAnfitrionAuth } from './core/auth/AuthContext';
import { alojamientoService } from './features/alojamientos/services/alojamientoService';
import { Alojamiento } from './core/types/anfitrion.types';
import * as apiEndpoints from './core/api/apiEndpoints';
import { CheckCircle2 } from 'lucide-react';

// Parser bidireccional de ruta para persistencia absoluta en F5 / recargas
const parseRouteFromLocation = (): {
  seccion: string;
  alojamientoId: string | null;
  habitacionId: string | null;
} => {
  const hash = window.location.hash.replace(/^#\/?/, '').trim();
  const saved = localStorage.getItem('alojate_anfitrion_route') || '';
  const target = hash || saved || 'dashboard';
  const parts = target.split('/').filter(Boolean);

  const seccionCandidata = parts[0] || 'dashboard';
  const validas = ['dashboard', 'alojamientos', 'recepcion', 'finanzas', 'reportes', 'perfil'];
  const seccion = validas.includes(seccionCandidata) ? seccionCandidata : 'dashboard';

  let alojamientoId: string | null = null;
  let habitacionId: string | null = null;

  if (seccion === 'alojamientos' && parts[1]) {
    alojamientoId = parts[1];
    if (parts[2] === 'habitaciones' && parts[3]) {
      habitacionId = parts[3];
    }
  }

  return { seccion, alojamientoId, habitacionId };
};

export const AppContent: React.FC = () => {
  const { anfitrionClave, isAuthenticated, cargandoSSO, rolNoPermitido, logout } = useAnfitrionAuth();
  
  // Estado de ruta sincronizado con Hash URL y LocalStorage
  const rutaInicial = parseRouteFromLocation();
  const [seccionActiva, setSeccionActiva] = useState<string>(rutaInicial.seccion);
  const [alojamientoIdActivo, setAlojamientoIdActivo] = useState<string | null>(rutaInicial.alojamientoId);
  const [habitacionIdActiva, setHabitacionIdActiva] = useState<string | null>(rutaInicial.habitacionId);

  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [wizardGlobalAbierto, setWizardGlobalAbierto] = useState(false);
  
  // Lista reactiva de alojamientos según el anfitrión activo
  const [alojamientos, setAlojamientos] = useState<Alojamiento[]>(() =>
    alojamientoService.obtenerPorAnfitrion(anfitrionClave)
  );

  // Toast flotante
  const [toastMensaje, setToastMensaje] = useState<string | null>(null);

  // Navegación con persistencia en Hash y LocalStorage
  const navegarA = (
    seccion: string,
    idAlojamiento: string | null = null,
    idHabitacion: string | null = null
  ) => {
    setSeccionActiva(seccion);
    setAlojamientoIdActivo(idAlojamiento);
    setHabitacionIdActiva(idHabitacion);

    let newHash = `#/${seccion}`;
    if (seccion === 'alojamientos' && idAlojamiento) {
      newHash += `/${idAlojamiento}`;
      if (idHabitacion) {
        newHash += `/habitaciones/${idHabitacion}`;
      }
    }

    if (window.location.hash !== newHash) {
      window.location.hash = newHash;
    }
    localStorage.setItem('alojate_anfitrion_route', newHash.replace(/^#\/?/, ''));
  };

  // Sincronizar eventos de retroceso/avance del navegador y recargas
  useEffect(() => {
    const handleHashChange = () => {
      const parsed = parseRouteFromLocation();
      setSeccionActiva(parsed.seccion);
      setAlojamientoIdActivo(parsed.alojamientoId);
      setHabitacionIdActiva(parsed.habitacionId);
      localStorage.setItem('alojate_anfitrion_route', window.location.hash.replace(/^#\/?/, ''));
    };

    window.addEventListener('hashchange', handleHashChange);

    // Asegurar que el hash inicial esté en la barra de direcciones
    const parsed = parseRouteFromLocation();
    let initialHash = `#/${parsed.seccion}`;
    if (parsed.alojamientoId) {
      initialHash += `/${parsed.alojamientoId}`;
      if (parsed.habitacionId) {
        initialHash += `/habitaciones/${parsed.habitacionId}`;
      }
    }
    if (window.location.hash !== initialHash) {
      window.location.hash = initialHash;
    }
    localStorage.setItem('alojate_anfitrion_route', initialHash.replace(/^#\/?/, ''));

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Recargar alojamientos y sincronizar reservas con el servidor
  useEffect(() => {
    if (!isAuthenticated || rolNoPermitido) return;
    setAlojamientos(alojamientoService.obtenerPorAnfitrion(anfitrionClave));
    alojamientoService.sincronizarConServidor(anfitrionClave).then((sincronizados) => {
      setAlojamientos(sincronizados);
    });
  }, [anfitrionClave, seccionActiva, isAuthenticated, rolNoPermitido]);

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

  // Título dinámico para el breadcrumb de TopHeader
  const getHeaderInfo = () => {
    if (seccionActiva === 'alojamientos' && alojamientoIdActivo) {
      const aloj = alojamientos.find(a => a.idAlojamiento === alojamientoIdActivo);
      if (habitacionIdActiva && aloj?.unidades) {
        const hab = aloj.unidades.find(u => u.idUnidad === habitacionIdActiva);
        return { titulo: `${aloj.titulo} / ${hab?.nombre || 'Habitación'}` };
      }
      return { titulo: aloj?.titulo || 'Editor de Alojamiento' };
    }

    switch (seccionActiva) {
      case 'dashboard':
        return { titulo: 'Dashboard' };
      case 'alojamientos':
        return { titulo: 'Mis Alojamientos' };
      case 'recepcion':
        return { titulo: 'Recepción & PIN' };
      case 'finanzas':
        return { titulo: 'Finanzas' };
      case 'reportes':
        return { titulo: 'Reportes IA' };
      case 'perfil':
        return { titulo: 'Mi Perfil' };
      default:
        return { titulo: 'Panel del Anfitrión' };
    }
  };

  const headerInfo = getHeaderInfo();

  if (cargandoSSO) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-slate-100 font-sans">
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
          <svg className="w-5 h-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span>Sincronizando sesión SSO central...</span>
        </div>
      </div>
    );
  }

  if (rolNoPermitido || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100 font-sans select-none">
        <div className="max-w-md w-full p-8 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800 border border-slate-700/60 text-slate-400 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-slate-800 text-slate-400 border border-slate-700">
              404
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">Página no encontrada</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              La página que buscas no existe o ha sido movida.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100">
      
      {/* Sidebar Lateral Fijo */}
      <SidebarLateral
        seccionActiva={seccionActiva}
        onCambiarSeccion={(s) => {
          navegarA(s, null, null);
          setMenuMovilAbierto(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        conteoPendientes={conteoPendientes}
        conteoAlojamientos={alojamientos.length}
        menuMovilAbierto={menuMovilAbierto}
        onCerrarMenuMovil={() => setMenuMovilAbierto(false)}
      />

      {/* Área Principal de Contenido (a la derecha del Sidebar) */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        
        {/* Cabecera Superior Fija */}
        <TopHeader
          titulo={headerInfo.titulo}
          onAbrirMenuMovil={() => setMenuMovilAbierto(true)}
        />

        {/* Cuerpo de la Sección Activa */}
        <main className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 flex-1">
          {seccionActiva === 'dashboard' && (
            <TableroEjecutivo
              alojamientos={alojamientos}
              onIrARecepcion={() => navegarA('recepcion', null, null)}
              onIrAAlojamientos={() => navegarA('alojamientos', null, null)}
              onValidarPinUnidad={() => navegarA('recepcion', null, null)}
              onCheckoutUnidad={() => navegarA('recepcion', null, null)}
            />
          )}

          {seccionActiva === 'alojamientos' && (
            <ListaAlojamientos
              alojamientos={alojamientos}
              onGuardarLista={(nuevaLista, mostrarAviso = false) => {
                handleGuardarAlojamientos(nuevaLista);
                if (mostrarAviso) {
                  mostrarToast('Alojamiento y unidades guardados exitosamente.');
                }
              }}
              onPublicarNuevo={() => setWizardGlobalAbierto(true)}
              alojamientoEnEdicionId={alojamientoIdActivo}
              habitacionEnEdicionId={habitacionIdActiva}
              onSeleccionarAlojamiento={(id) => {
                navegarA('alojamientos', id, null);
              }}
              onSeleccionarHabitacion={(idHab) => {
                navegarA('alojamientos', alojamientoIdActivo, idHab);
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
            <LiquidacionesBNB
              onMostrarToast={mostrarToast}
              alojamientos={alojamientos}
            />
          )}

          {seccionActiva === 'reportes' && (
            <ReportesGenerativosIA
              alojamientos={alojamientos}
              onMostrarToast={mostrarToast}
            />
          )}

          {seccionActiva === 'perfil' && (
            <MiPerfilScreen onMostrarToast={mostrarToast} />
          )}
        </main>
      </div>

      {/* Modal Asistente de Publicación Global */}
      <ListingWizardModal
        isOpen={wizardGlobalAbierto}
        onClose={() => setWizardGlobalAbierto(false)}
        onAlojamientoCreado={(nuevo) => {
          handleGuardarAlojamientos([nuevo, ...alojamientos.filter(a => a.idAlojamiento !== nuevo.idAlojamiento)]);
          mostrarToast('¡Alojamiento enviado a auditoría con éxito!');
          navegarA('alojamientos', null, null);
        }}
      />

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