import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './core/auth/AuthContext';
import { TokenStorage } from './core/auth/TokenStorage';
import { useAppRouter } from './core/router/useAppRouter';
import { Navbar } from './shared/layout/Navbar';
import { Footer } from './shared/layout/Footer';
import { HeroSection } from './features/catalogo/components/HeroSection';
import { FiltrosDepartamentos } from './features/catalogo/components/FiltrosDepartamentos';
import { AlojamientoGrid } from './features/catalogo/components/AlojamientoGrid';
import { DetalleAlojamientoView } from './features/catalogo/components/DetalleAlojamientoView';
import { SolicitudReservaModal } from './features/reservas/modals/SolicitudReservaModal';
import { CheckoutPagoModal } from './features/checkout/modals/CheckoutPagoModal';
import { PagoExitosoModal } from './features/checkout/modals/PagoExitosoModal';
import { AuthLiquidModal } from './features/auth/modals/AuthLiquidModal';
import { MisViajesView } from './features/mis-viajes/components/MisViajesView';
import { ValidadorPinCheckin } from './features/anfitrion/components/ValidadorPinCheckin';
import { GestorRolesPermisos } from './features/anfitrion/components/GestorRolesPermisos';
import { LiquidacionesResumen } from './features/anfitrion/components/LiquidacionesResumen';
import { ListingWizardModal } from './features/anfitrion/modals/ListingWizardModal';
import { EditorHotelHabitacionesModal } from './features/anfitrion/modals/EditorHotelHabitacionesModal';
import { catalogoService } from './features/catalogo/services/catalogoService';
import { Alojamiento, UnidadReservable } from './features/catalogo/types/catalogo.types';
import { ReservaResponse } from './features/reservas/types/reserva.types';
import { httpClient } from './core/api/httpClient';
import { ENDPOINTS, ANFITRION_URL } from './core/api/apiEndpoints';
import { Plus, Building2, Home, Hotel, Eye, ShieldCheck, AlertCircle, ArrowLeft, Loader2, Edit3, RefreshCw, ExternalLink } from 'lucide-react';

export const AppContent: React.FC = () => {
  const { user, token, logout } = useAuth();
  const { currentView, params, navigate } = useAppRouter();
  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  // Theme State con persistencia en LocalStorage
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('alojate_theme_mode');
      if (saved !== null) {
        return saved === 'dark';
      }
      return true;
    } catch {
      return true;
    }
  });

  // Proteger vista de Anfitrión: Si el usuario es Cliente o no está autenticado, redirigir a catálogo
  useEffect(() => {
    if (currentView === 'anfitrion' && user?.rol !== 'ANFITRION') {
      navigate.catalogo();
    }
  }, [user, currentView, navigate]);

  // Single Logout (SLO): Detección de revocación global de sesión desde Portal Anfitrión (:3005)
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hashPart = window.location.hash || '';
    const hashParams = hashPart.includes('?') 
      ? new URLSearchParams(hashPart.split('?')[1]) 
      : null;
    
    if (searchParams.get('sso_logout') === 'true' || hashParams?.get('sso_logout') === 'true') {
      logout();
      setMisReservas([]);
      localStorage.removeItem('alojate_mis_reservas');
      const cleanUrl = window.location.pathname + '#/catalogo';
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [logout]);
  
  // Data States
  const [alojamientos, setAlojamientos] = useState<Alojamiento[]>([]);
  const [misAlojamientosAnfitrion, setMisAlojamientosAnfitrion] = useState<Alojamiento[]>([]);
  const [filtroEstadoAnfitrion, setFiltroEstadoAnfitrion] = useState<string>('TODOS');
  const [recargandoMisAlojamientos, setRecargandoMisAlojamientos] = useState<boolean>(false);
  const [departamento, setDepartamento] = useState(params.depto || 'Todos');
  const [loading, setLoading] = useState(true);
  const [misReservas, setMisReservas] = useState<ReservaResponse[]>(() => {
    try {
      const token = TokenStorage.getToken();
      const savedUser = TokenStorage.getUser();
      if (!token || !savedUser) return [];
      const saved = sessionStorage.getItem('alojate_mis_reservas');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleLogout = () => {
    setCerrandoSesion(true);
    setTimeout(() => {
      logout();
      setMisReservas([]);
      sessionStorage.removeItem('alojate_mis_reservas');
      setCerrandoSesion(false);
      navigate.catalogo();
    }, 700);
  };

  // Modal & Detalle Flow States
  const [detalleAlojamiento, setDetalleAlojamiento] = useState<Alojamiento | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState<string | null>(null);

  const [unidadSeleccionada, setUnidadSeleccionada] = useState<UnidadReservable | null>(null);
  const [datosReservaPrevia, setDatosReservaPrevia] = useState<{
    checkIn: string;
    checkOut: string;
    huespedes: number;
  } | null>(null);
  const [reservaAlojamiento, setReservaAlojamiento] = useState<Alojamiento | null>(null);
  const [reservaActiva, setReservaActiva] = useState<ReservaResponse | null>(null);
  const [pagoCompletadoData, setPagoCompletadoData] = useState<any | null>(null);
  const [pinConfirmado, setPinConfirmado] = useState<string>('');
  const [wizardAbierto, setWizardAbierto] = useState(false);
  const [editorHotelAbierto, setEditorHotelAbierto] = useState(false);
  const [alojamientoEnEdicion, setAlojamientoEnEdicion] = useState<Alojamiento | null>(null);

  // Sincronizar parámetro de departamento si viene en la URL
  useEffect(() => {
    if (params.depto && params.depto !== departamento) {
      setDepartamento(params.depto);
    }
  }, [params.depto]);

  // Carga reactiva de Detalle por URL [id] al recargar con F5 o acceder directamente
  useEffect(() => {
    if (currentView === 'detalle' && params.id) {
      // Si ya está en memoria y coincide el ID, no recargar
      if (detalleAlojamiento && detalleAlojamiento.idAlojamiento === params.id) {
        return;
      }

      let isMounted = true;
      setCargandoDetalle(true);
      setErrorDetalle(null);

      catalogoService.obtenerPorId(params.id)
        .then((alojamiento) => {
          if (isMounted) {
            setDetalleAlojamiento(alojamiento);
            setCargandoDetalle(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            console.error('Error al resolver alojamiento por ID en ruta:', err);
            setErrorDetalle(err.message || 'No se encontró el alojamiento solicitado.');
            setCargandoDetalle(false);
          }
        });

      return () => {
        isMounted = false;
      };
    }
  }, [currentView, params.id, detalleAlojamiento]);

  // Sincronizar Modo Oscuro con clase 'dark' en el elemento HTML y persistir en LocalStorage
  useEffect(() => {
    try {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('alojate_theme_mode', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('alojate_theme_mode', 'light');
      }
    } catch (e) {
      console.warn('Error al persistir tema:', e);
    }
  }, [darkMode]);

  // Cargar Catálogo de Alojamientos Publicados para Clientes
  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      const data = await catalogoService.listarAlojamientosPublicados(departamento);
      setAlojamientos(data);
      setLoading(false);
    };
    cargar();
  }, [departamento]);

  // Función para recargar Alojamientos propios del Anfitrión en tiempo real
  const recargarAlojamientosAnfitrion = async () => {
    if (user?.rol === 'ANFITRION') {
      setRecargandoMisAlojamientos(true);
      try {
        const data = await catalogoService.listarAlojamientosPorAnfitrion({
          id: user.id,
          email: user.email,
          nombre: user.nombre
        });
        setMisAlojamientosAnfitrion(data);
      } catch (err) {
        console.warn('Error al sincronizar alojamientos del anfitrión:', err);
      } finally {
        setRecargandoMisAlojamientos(false);
      }
    } else {
      setMisAlojamientosAnfitrion([]);
    }
  };

  // Cargar Alojamientos propios del Anfitrión y sincronizar automáticamente al enfocar ventana o por polling
  useEffect(() => {
    recargarAlojamientosAnfitrion();

    const handleFocus = () => {
      recargarAlojamientosAnfitrion();
    };
    window.addEventListener('focus', handleFocus);

    // Polling ligero reactivo cada 6 segundos en el panel de anfitrión para reflejar moderación en tiempo real
    let interval: any = null;
    if (user?.rol === 'ANFITRION' && currentView === 'anfitrion') {
      interval = setInterval(() => {
        recargarAlojamientosAnfitrion();
      }, 6000);
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
      if (interval) clearInterval(interval);
    };
  }, [user, currentView]);

  // Sincronizar Reservas del Cliente (MS-02 y LocalStorage)
  useEffect(() => {
    if (!user) {
      setMisReservas([]);
      return;
    }

    const cargarReservas = async () => {
      try {
        const clienteId = user.id;
        let reservasServidor: ReservaResponse[] = [];
        
        try {
          const resp = await httpClient.get<ReservaResponse[]>(ENDPOINTS.RESERVAS.CLIENTE_HISTORIAL(clienteId));
          if (Array.isArray(resp.data)) {
            reservasServidor = resp.data;
          }
        } catch (e) {
          console.warn('Fallo al obtener historial por cliente, consultando endpoint general', e);
        }

        if (reservasServidor.length === 0) {
          try {
            const respGeneral = await httpClient.get<ReservaResponse[]>(ENDPOINTS.RESERVAS.CREAR);
            if (Array.isArray(respGeneral.data)) {
              reservasServidor = respGeneral.data.filter(
                (r: any) => r.idCliente === clienteId || (user && r.nombreCliente?.toLowerCase().includes(user.nombre.toLowerCase()))
              );
            }
          } catch (e) {
            console.warn('Error al consultar reservas generales', e);
          }
        }

        // Combinar con localStorage
        setMisReservas((prev) => {
          const map = new Map<string, ReservaResponse>();
          prev.forEach((r) => map.set(r.idReserva, r));
          reservasServidor.forEach((r) => map.set(r.idReserva, r));
          const combinadas = Array.from(map.values());
          localStorage.setItem('alojate_mis_reservas', JSON.stringify(combinadas));
          return combinadas;
        });
      } catch (err) {
        console.error('Error al sincronizar reservas:', err);
      }
    };

    cargarReservas();
  }, [user]);

  // Manejador de flujo de Reserva -> Checkout
  const handleReservaCreada = (reserva: ReservaResponse) => {
    setReservaAlojamiento(null);
    setReservaActiva(reserva);
  };

  // Manejador de Pago Completado -> Modal Celebración con PIN
  const handlePagoExitoso = (pagoResultado: any, codigoCheckin: string) => {
    setReservaActiva(null);
    setPagoCompletadoData(pagoResultado);
    setPinConfirmado(codigoCheckin);
    
    // Guardar en la lista de reservas activas del cliente
    if (reservaActiva) {
      const confirmada: ReservaResponse = {
        ...reservaActiva,
        estado: 'CONFIRMADA' as const,
        codigoCheckin: codigoCheckin || reservaActiva.codigoCheckin
      };
      setMisReservas((prev) => {
        const actualizadas = [confirmada, ...prev.filter(r => r.idReserva !== confirmada.idReserva)];
        localStorage.setItem('alojate_mis_reservas', JSON.stringify(actualizadas));
        return actualizadas;
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* 1. Header con Navbar Conectada a Rutas */}
      <Navbar
        currentView={currentView}
        onChangeView={(view) => {
          if (view === 'catalogo') navigate.catalogo();
          else if (view === 'mis-viajes') navigate.misViajes();
          else if (view === 'anfitrion') navigate.anfitrion();
        }}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onLogout={handleLogout}
      />

      {/* 2. Contenido Dinámico según la Ruta */}
      <main className="flex-1">
        {currentView === 'catalogo' && (
          <div className="space-y-8 pb-16">
            <HeroSection onSearch={(q) => console.log('Búsqueda:', q)} />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-3">
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">
                    Alojamientos Disponibles en Bolivia
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Propiedades verificadas con bloqueo de inventario en tiempo real
                  </p>
                </div>
              </div>

              <FiltrosDepartamentos
                departamentoSeleccionado={departamento}
                onSelect={(d) => {
                  setDepartamento(d);
                  navigate.catalogo(d);
                }}
              />

              <AlojamientoGrid
                alojamientos={alojamientos}
                loading={loading}
                onSelect={(a) => {
                  setDetalleAlojamiento(a);
                  navigate.detalle(a.idAlojamiento);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onReservarDirecto={(a) => {
                  setUnidadSeleccionada(a.unidades?.[0] || null);
                  setDatosReservaPrevia(null);
                  setReservaAlojamiento(a);
                }}
              />
            </div>
          </div>
        )}

        {currentView === 'detalle' && (
          <>
            {cargandoDetalle && (
              <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-600 shadow-lg shadow-blue-500/10 animate-pulse">
                  <Building2 className="w-8 h-8 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                    Cargando alojamiento...
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sincronizando información y disponibilidad desde la red nacional
                  </p>
                </div>
              </div>
            )}

            {!cargandoDetalle && errorDetalle && (
              <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6 animate-fade-in">
                <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto shadow-lg shadow-red-500/10">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                    Alojamiento no encontrado
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    {errorDetalle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate.catalogo()}
                  className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition inline-flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver al Catálogo Nacional</span>
                </button>
              </div>
            )}

            {!cargandoDetalle && !errorDetalle && detalleAlojamiento && (
              <DetalleAlojamientoView
                alojamiento={detalleAlojamiento}
                onVolver={() => navigate.back()}
                onFiltrarDepartamento={(depto) => {
                  setDepartamento(depto);
                  navigate.catalogo(depto);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onFiltrarCiudad={(ciudad) => {
                  if (detalleAlojamiento.departamento) {
                    setDepartamento(detalleAlojamiento.departamento);
                    navigate.catalogo(detalleAlojamiento.departamento);
                  } else {
                    navigate.catalogo();
                  }
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onReservar={(a, u, ci, co, h) => {
                  setUnidadSeleccionada(u);
                  setDatosReservaPrevia({ checkIn: ci, checkOut: co, huespedes: h });
                  setReservaAlojamiento(a);
                }}
              />
            )}
          </>
        )}

        {currentView === 'mis-viajes' && (
          <MisViajesView
            reservas={misReservas}
            onNuevaReserva={() => navigate.catalogo()}
            onActualizarReservas={(nuevas) => {
              setMisReservas(nuevas);
              localStorage.setItem('alojate_mis_reservas', JSON.stringify(nuevas));
            }}
            onDejarResena={(alojamientoId) => {
              const target = alojamientos.find((a) => a.idAlojamiento === alojamientoId);
              if (target) {
                setDetalleAlojamiento(target);
              } else {
                catalogoService
                  .obtenerPorId(alojamientoId)
                  .then((data) => {
                    if (data) setDetalleAlojamiento(data);
                  })
                  .catch(() => {});
              }
              navigate.detalle(alojamientoId);
              setTimeout(() => {
                const el = document.getElementById('seccion-resenas');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              }, 400);
            }}
          />
        )}

        {currentView === 'anfitrion' && user?.rol === 'ANFITRION' && (
          <div className="max-w-3xl mx-auto py-16 px-4 text-center space-y-6 animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-center mx-auto shadow-xl shadow-blue-500/25">
              <Building2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600 dark:text-blue-400">
                PORTAL DEDICADO DE GESTIÓN HOTELERA
              </span>
              <h2 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">
                Panel Oficial del Anfitrión
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                El entorno integral para gestionar tus alojamientos, suites de hotel, estados de auditoría en tiempo real (Publicados, Pendientes, Observados, Suspendidos), finanzas y control de llaves por PIN se encuentra en el Portal del Anfitrión.
              </p>
            </div>

            <div className="pt-2">
              <a
                href={`${ANFITRION_URL}?sso_token=${encodeURIComponent(token || '')}&sso_email=${encodeURIComponent(user.email || '')}&sso_nombre=${encodeURIComponent(user.nombre || '')}&sso_rol=ANFITRION`}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-blue-500/30 transition transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Ingresar al Panel del Anfitrión</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <p className="text-[11px] text-slate-400">
              Sesión activa validada mediante Single Sign-On (SSO) como <strong>{user.nombre} {user.apellido}</strong> ({user.email}).
            </p>
          </div>
        )}
      </main>

      {/* 3. Footer */}
      <Footer />

      {/* 4. Modales Desacoplados (Liquid Glass) */}
      <AuthLiquidModal />

      <SolicitudReservaModal
        alojamiento={reservaAlojamiento}
        unidadPreseleccionada={unidadSeleccionada}
        fechasIniciales={datosReservaPrevia}
        onClose={() => {
          setReservaAlojamiento(null);
          setUnidadSeleccionada(null);
          setDatosReservaPrevia(null);
        }}
        onReservaCreada={handleReservaCreada}
      />

      <CheckoutPagoModal
        reserva={reservaActiva}
        onClose={() => setReservaActiva(null)}
        onPagoCompletado={handlePagoExitoso}
      />

      <PagoExitosoModal
        isOpen={!!pagoCompletadoData}
        onClose={() => {
          setPagoCompletadoData(null);
          navigate.misViajes();
        }}
        pagoResultado={pagoCompletadoData}
        codigoCheckin={pinConfirmado}
      />

      <ListingWizardModal
        isOpen={wizardAbierto}
        onClose={() => setWizardAbierto(false)}
        onAlojamientoCreado={(nuevo) => {
          catalogoService.guardarAlojamientoLocal(nuevo);
          setMisAlojamientosAnfitrion((prev) => [nuevo, ...prev.filter(p => p.idAlojamiento !== nuevo.idAlojamiento)]);
          recargarAlojamientosAnfitrion();
        }}
      />

      <EditorHotelHabitacionesModal
        isOpen={editorHotelAbierto}
        onClose={() => {
          setEditorHotelAbierto(false);
          setAlojamientoEnEdicion(null);
        }}
        alojamiento={alojamientoEnEdicion}
        onAlojamientoActualizado={(actualizado) => {
          setMisAlojamientosAnfitrion((prev) =>
            prev.map((item) => (item.idAlojamiento === actualizado.idAlojamiento ? actualizado : item))
          );
          setAlojamientos((prev) =>
            prev.map((item) => (item.idAlojamiento === actualizado.idAlojamiento ? actualizado : item))
          );
          if (detalleAlojamiento?.idAlojamiento === actualizado.idAlojamiento) {
            setDetalleAlojamiento(actualizado);
          }
          recargarAlojamientosAnfitrion();
        }}
      />

      {/* Animación Visual de Cierre de Sesión Seguro */}
      {cerrandoSesion && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 backdrop-blur-md animate-fade-in select-none">
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4 max-w-sm mx-4 animate-modal-in">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-sm">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                Cerrando Sesión de Forma Segura
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Limpiando credenciales activas y datos de reserva...
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
