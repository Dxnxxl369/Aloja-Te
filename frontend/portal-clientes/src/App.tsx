import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './core/auth/AuthContext';
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
import { catalogoService } from './features/catalogo/services/catalogoService';
import { Alojamiento, UnidadReservable } from './features/catalogo/types/catalogo.types';
import { ReservaResponse } from './features/reservas/types/reserva.types';
import { httpClient } from './core/api/httpClient';
import { ENDPOINTS } from './core/api/apiEndpoints';
import { Plus, Building2, Home, Hotel, Eye, ShieldCheck, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

export const AppContent: React.FC = () => {
  const { user, logout } = useAuth();
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
  
  // Data States
  const [alojamientos, setAlojamientos] = useState<Alojamiento[]>([]);
  const [departamento, setDepartamento] = useState(params.depto || 'Todos');
  const [loading, setLoading] = useState(true);
  const [misReservas, setMisReservas] = useState<ReservaResponse[]>(() => {
    try {
      const token = localStorage.getItem('alojate_jwt_token');
      const savedUser = localStorage.getItem('alojate_user_profile');
      if (!token || !savedUser) return [];
      const saved = localStorage.getItem('alojate_mis_reservas');
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
      localStorage.removeItem('alojate_mis_reservas');
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

  // Cargar Catálogo de Alojamientos
  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      const data = await catalogoService.listarAlojamientos(departamento);
      setAlojamientos(data);
      setLoading(false);
    };
    cargar();
  }, [departamento]);

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
          <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 block mb-1">
                  GESTIÓN DE ALOJAMIENTOS &amp; RECEPCIÓN
                </span>
                <h2 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">
                  Panel de Control del Anfitrión
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Publica casas u hoteles con gestión de habitaciones y valida el ingreso de huéspedes.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setWizardAbierto(true)}
                className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition flex items-center gap-2 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>+ Publicar Nuevo Alojamiento</span>
              </button>
            </div>

            {/* Alojamientos del Anfitrión */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                    Tus Propiedades Registradas ({alojamientos.length})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Propiedades en catálogo o en espera de aprobación
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setWizardAbierto(true)}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {alojamientos.map((a) => (
                  <div
                    key={a.idAlojamiento}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 hover:border-blue-400 transition flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={a.fotografias?.[0]?.url || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=80'}
                        alt={a.titulo}
                        className="w-16 h-14 object-cover rounded-xl shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{a.titulo}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                          <span>{a.ciudad}, {a.departamento}</span>
                          <span>•</span>
                          <span className="font-semibold">{a.modalidad === 'HOTEL_HOSTAL' ? '🏨 Hotel' : '🏡 Casa'}</span>
                        </div>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          a.estadoPublicacion === 'PUBLICADO'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                        }`}>
                          {a.estadoPublicacion || 'PUBLICADO'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setDetalleAlojamiento(a);
                        navigate.detalle(a.idAlojamiento);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-800 transition"
                      title="Ver Pantalla Completa"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <ValidadorPinCheckin reservaIdDefecto={misReservas[0]?.idReserva} />
              <GestorRolesPermisos />
              <LiquidacionesResumen />
            </div>
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
          setAlojamientos((prev) => [nuevo, ...prev]);
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
