import React, { useState, useEffect } from 'react';
import {
  Plus,
  Eye,
  AlertTriangle,
  Search,
  Building2,
  RefreshCw
} from 'lucide-react';
import { Alojamiento } from '../../../core/types/anfitrion.types';
import { EditorHotelPantalla } from './EditorHotelPantalla';
import { ListingWizardModal } from '../modals/ListingWizardModal';
import { useAnfitrionAuth } from '../../../core/auth/AuthContext';
import { alojamientoService } from '../services/alojamientoService';

interface ListaAlojamientosProps {
  alojamientos: Alojamiento[];
  onGuardarLista: (nuevaLista: Alojamiento[]) => void;
  onPublicarNuevo?: () => void;
  alojamientoEnEdicionId?: string | null;
  habitacionEnEdicionId?: string | null;
  onSeleccionarAlojamiento?: (id: string | null) => void;
  onSeleccionarHabitacion?: (idHabitacion: string | null) => void;
}

export const ListaAlojamientos: React.FC<ListaAlojamientosProps> = ({
  alojamientos,
  onGuardarLista,
  onPublicarNuevo,
  alojamientoEnEdicionId,
  habitacionEnEdicionId,
  onSeleccionarAlojamiento,
  onSeleccionarHabitacion
}) => {
  const { anfitrionClave } = useAnfitrionAuth();
  const [alojamientoEnEdicionIdLocal, setAlojamientoEnEdicionIdLocal] = useState<string | null>(
    () => alojamientoEnEdicionId || null
  );

  const abrirEdicion = (id: string | null) => {
    setAlojamientoEnEdicionIdLocal(id);
    onSeleccionarAlojamiento?.(id);
  };

  useEffect(() => {
    if (alojamientoEnEdicionId !== undefined) {
      setAlojamientoEnEdicionIdLocal(alojamientoEnEdicionId);
    }
  }, [alojamientoEnEdicionId]);
  const [wizardAbierto, setWizardAbierto] = useState<boolean>(false);
  
  // Filtros limpios
  const [tabFiltro, setTabFiltro] = useState<'TODOS' | 'PUBLICADOS' | 'ATENCION'>('TODOS');
  const [filtroDepto, setFiltroDepto] = useState<string>('TODOS');
  const [filtroModalidad, setFiltroModalidad] = useState<string>('TODOS');
  const [busquedaTexto, setBusquedaTexto] = useState<string>('');
  const [sincronizando, setSincronizando] = useState<boolean>(false);

  // Sincronización en segundo plano con auditoría central
  const ejecutarSincronizacion = async () => {
    setSincronizando(true);
    try {
      const actualizados = await alojamientoService.sincronizarConServidor(anfitrionClave);
      onGuardarLista(actualizados);
    } catch (e) {
      console.warn('Error durante sincronización:', e);
    } finally {
      setSincronizando(false);
    }
  };

  useEffect(() => {
    const handleFocus = () => ejecutarSincronizacion();
    window.addEventListener('focus', handleFocus);
    const timer = setInterval(() => ejecutarSincronizacion(), 10000);
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(timer);
    };
  }, [anfitrionClave]);

  // Conteo de estados
  const conteoTodos = alojamientos.length;
  const conteoPublicados = alojamientos.filter(
    a => (a.estadoPublicacion || a.estado || 'PUBLICADO') === 'PUBLICADO'
  ).length;
  const conteoAtencion = alojamientos.filter(a => {
    const st = a.estadoPublicacion || a.estado || 'PUBLICADO';
    return st === 'OBSERVADO' || st === 'PENDIENTE' || st === 'SUSPENDIDO' || st === 'RECHAZADO';
  }).length;

  // Propiedades observadas (para alerta de 1 línea)
  const propiedadesObservadas = alojamientos.filter(
    a => (a.estadoPublicacion || a.estado) === 'OBSERVADO'
  );

  // Filtrado reactivo
  const filtrados = alojamientos.filter(a => {
    const estadoReal = a.estadoPublicacion || a.estado || 'PUBLICADO';
    
    // Tab
    let cumpleTab = true;
    if (tabFiltro === 'PUBLICADOS') {
      cumpleTab = estadoReal === 'PUBLICADO';
    } else if (tabFiltro === 'ATENCION') {
      cumpleTab = estadoReal === 'OBSERVADO' || estadoReal === 'PENDIENTE' || estadoReal === 'SUSPENDIDO' || estadoReal === 'RECHAZADO';
    }

    // Departamento
    const cumpleDepto = filtroDepto === 'TODOS' || a.departamento === filtroDepto;

    // Modalidad
    const esHotel = a.modalidad === 'HOTEL_HOSTAL' || a.tipoPropiedad?.toUpperCase() === 'HOTEL';
    const cumpleModalidad =
      filtroModalidad === 'TODOS' ||
      (filtroModalidad === 'HOTEL' && esHotel) ||
      (filtroModalidad === 'CASA' && !esHotel);

    // Texto
    const cumpleBusqueda =
      !busquedaTexto.trim() ||
      a.titulo.toLowerCase().includes(busquedaTexto.toLowerCase()) ||
      a.ciudad.toLowerCase().includes(busquedaTexto.toLowerCase()) ||
      a.departamento.toLowerCase().includes(busquedaTexto.toLowerCase());

    return cumpleTab && cumpleDepto && cumpleModalidad && cumpleBusqueda;
  });

  const alojamientoActivoEdicion = alojamientos.find(a => a.idAlojamiento === alojamientoEnEdicionIdLocal) || null;

  const handleGuardarHotel = (actualizado: Alojamiento) => {
    const nuevaLista = alojamientos.map(a =>
      a.idAlojamiento === actualizado.idAlojamiento ? actualizado : a
    );
    onGuardarLista(nuevaLista);
    alojamientoService.guardar(anfitrionClave, nuevaLista);
    abrirEdicion(null);
  };

  const handleNuevoAlojamientoCreado = (nuevo: Alojamiento) => {
    const nuevaLista = [nuevo, ...alojamientos.filter(a => a.idAlojamiento !== nuevo.idAlojamiento)];
    onGuardarLista(nuevaLista);
    setWizardAbierto(false);
  };

  // Si está en pantalla completa de edición del hotel/propiedad:
  if (alojamientoEnEdicionIdLocal && alojamientoActivoEdicion) {
    return (
      <EditorHotelPantalla
        alojamiento={alojamientoActivoEdicion}
        onVolver={() => abrirEdicion(null)}
        onGuardarHotel={handleGuardarHotel}
        habitacionEnPantallaIdInicial={habitacionEnEdicionId}
        onCambiarHabitacion={(idHab) => onSeleccionarHabitacion?.(idHab)}
      />
    );
  }

  // Ciudades / departamentos presentes
  const departamentosUnicos = Array.from(new Set(alojamientos.map(a => a.departamento).filter(Boolean)));

  return (
    <div className="space-y-5 animate-fade-in pb-16">
      
      {/* 1. H1 + Único Botón Primario */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
            Mis Alojamientos
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {alojamientos.length} {alojamientos.length === 1 ? 'propiedad registrada' : 'propiedades registradas'}
            {departamentosUnicos.length > 0 ? ` en ${departamentosUnicos.join(', ')}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {sincronizando && (
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />
              Sincronizando
            </span>
          )}
          <button
            type="button"
            onClick={() => onPublicarNuevo ? onPublicarNuevo() : setWizardAbierto(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Publicar Propiedad</span>
          </button>
        </div>
      </div>

      {/* 2. Alerta de Auditoría Compacta de 1 sola línea (solo si existe) */}
      {propiedadesObservadas.length > 0 && (
        <div className="px-4 py-2.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-900/60 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2 truncate">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="truncate">
              <strong>{propiedadesObservadas[0].titulo}</strong> tiene 1 observación del auditor: "{propiedadesObservadas[0].motivoObservacionRechazo || propiedadesObservadas[0].motivoRechazo || 'Requiere revisión de fotografía principal y servicios'}"
            </span>
          </div>
          <button
            type="button"
            onClick={() => abrirEdicion(propiedadesObservadas[0].idAlojamiento)}
            className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold shrink-0 transition cursor-pointer"
          >
            Subsanar
          </button>
        </div>
      )}

      {/* 3. Fila Única de Filtros: Tabs + Búsqueda + Dropdowns */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Tabs de Filtro */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl self-start md:self-auto">
          <button
            type="button"
            onClick={() => setTabFiltro('TODOS')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              tabFiltro === 'TODOS'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Todos ({conteoTodos})
          </button>
          <button
            type="button"
            onClick={() => setTabFiltro('PUBLICADOS')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              tabFiltro === 'PUBLICADOS'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Publicados ({conteoPublicados})
          </button>
          {conteoAtencion > 0 && (
            <button
              type="button"
              onClick={() => setTabFiltro('ATENCION')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                tabFiltro === 'ATENCION'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-950/30'
              }`}
            >
              Requieren atención ({conteoAtencion})
            </button>
          )}
        </div>

        {/* Búsqueda y Dropdowns en la misma fila */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busquedaTexto}
              onChange={e => setBusquedaTexto(e.target.value)}
              placeholder="Buscar propiedad..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 w-44"
            />
          </div>

          <select
            value={filtroDepto}
            onChange={e => setFiltroDepto(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 outline-none cursor-pointer"
          >
            <option value="TODOS">Todos los departamentos</option>
            {departamentosUnicos.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={filtroModalidad}
            onChange={e => setFiltroModalidad(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 outline-none cursor-pointer"
          >
            <option value="TODOS">Todas las modalidades</option>
            <option value="HOTEL">Hoteles &amp; Hostales</option>
            <option value="CASA">Casas &amp; Cabañas</option>
          </select>
        </div>
      </div>

      {/* 4. Catálogo de Tarjetas */}
      {filtrados.length === 0 ? (
        <div className="p-12 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
              No se encontraron alojamientos con estos filtros
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Intenta cambiar los filtros seleccionados o el término de búsqueda.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-1">
          {filtrados.map(a => {
            const esHotel = a.modalidad === 'HOTEL_HOSTAL' || a.tipoPropiedad?.toUpperCase() === 'HOTEL';
            const estadoReal = a.estadoPublicacion || a.estado || 'PUBLICADO';
            const reservaActiva = a.reservas?.[0];

            const fotoPortada =
              (a.fotografias || []).find(f => f.esPrincipal)?.url ||
              a.fotografias?.[0]?.url ||
              'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80';

            // Estado operativo
            const isEnUso = a.estadoOperativo === 'EN_USO';
            const isPendientePin = a.estadoOperativo === 'PENDIENTE';

            // Excepción de auditoría (solo mostramos badge si NO es PUBLICADO)
            const esExcepcion = estadoReal !== 'PUBLICADO';

            return (
              <div
                key={a.idAlojamiento}
                className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between shadow-xs"
              >
                <div>
                  {/* Foto limpia: solo estado operativo y excepción si aplica */}
                  <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-900">
                    <img
                      src={fotoPortada}
                      alt={a.titulo}
                      className="w-full h-full object-cover"
                    />

                    {/* Estado operativo sobre la foto */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      {isEnUso ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-bold shadow-xs">
                          En uso
                        </span>
                      ) : isPendientePin ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold shadow-xs">
                          Pendiente de PIN
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-white text-[10px] font-medium backdrop-blur-xs">
                          Libre
                        </span>
                      )}

                      {/* Badge solo si es una excepción administrativa */}
                      {esExcepcion && (
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow-xs ${
                          estadoReal === 'OBSERVADO'
                            ? 'bg-amber-600 text-white'
                            : estadoReal === 'PENDIENTE'
                            ? 'bg-blue-600 text-white'
                            : 'bg-rose-600 text-white'
                        }`}>
                          {estadoReal === 'OBSERVADO' ? 'Observado' : estadoReal === 'PENDIENTE' ? 'En revisión' : estadoReal}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metadatos y detalles debajo de la foto */}
                  <div className="p-4 space-y-2">
                    {/* Título uniforme + Precio al lado */}
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                        {a.titulo}
                      </h3>
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white shrink-0">
                        Bs. {a.precioBaseNoche}
                        <span className="text-[10px] text-slate-400 font-normal font-sans">/noche</span>
                      </span>
                    </div>

                    {/* Metadatos en 1 sola línea */}
                    <p className="text-[11px] text-slate-400 truncate">
                      {esHotel ? 'Hotel' : (a.tipoPropiedad || 'Casa')} · {a.ciudad} · {esHotel ? `${a.unidades?.length || 1} habitaciones` : 'Residencia entera'}
                    </p>

                    {/* Ocupación en 1 sola línea */}
                    <div className="pt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {reservaActiva ? (
                        <span className="truncate">
                          <strong className="text-slate-700 dark:text-slate-300 font-medium">
                            {reservaActiva.huespedNombre}
                          </strong>
                          <span className="text-slate-400">
                            {' '}· {isEnUso ? 'sale hoy 14:00' : 'llegada hoy'}
                            {a.reservas && a.reservas.length > 1 ? ` · +${a.reservas.length - 1} reserva` : ''}
                          </span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Sin huéspedes actualmente</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botones de Acción: Uno primario + Ojo */}
                <div className="p-4 pt-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => abrirEdicion(a.idAlojamiento)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition text-center cursor-pointer"
                  >
                    {esHotel ? 'Administrar' : 'Editar Propiedad'}
                  </button>

                  <a
                    href={`http://localhost:3000/#/alojamientos/${a.idAlojamiento}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="Ver en catálogo de viajeros"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Modal Wizard de Publicación */}
      <ListingWizardModal
        isOpen={wizardAbierto}
        onClose={() => setWizardAbierto(false)}
        onAlojamientoCreado={handleNuevoAlojamientoCreado}
      />

    </div>
  );
};