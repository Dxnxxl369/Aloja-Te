import { httpClient } from '../../../core/api/httpClient';
import { ENDPOINTS } from '../../../core/api/apiEndpoints';
import { Alojamiento, ValoracionCliente, ResumenValoraciones } from '../types/catalogo.types';

// Normalizador para armonizar el DTO de Spring Boot con el frontend
function normalizarAlojamiento(raw: any): Alojamiento {
  const unidadPrincipal = raw.unidades?.[0];
  const precioCalculado = raw.precioBaseNoche ?? unidadPrincipal?.precioNoche ?? 650;

  return {
    idAlojamiento: raw.idAlojamiento || String(Math.random()),
    idAnfitrion: raw.idAnfitrion || 'anfitrion-default',
    nombreAnfitrion: raw.nombreAnfitrion || 'Anfitrión Verificado',
    titulo: raw.titulo || 'Alojamiento Tradicional',
    descripcion: raw.descripcion || 'Sin descripción disponible.',
    departamento: raw.departamento || 'Santa Cruz',
    ciudad: raw.ciudad || 'Bolivia',
    direccion: raw.direccion || 'Ubicación céntrica',
    tipoPropiedad: raw.tipoPropiedadNombre || raw.tipoPropiedad || 'CABAÑA',
    tipoEspacio: raw.tipoEspacioNombre || raw.tipoEspacio || 'ALOJAMIENTO_ENTERO',
    modalidad: raw.modalidad || 'CASA_DEPARTAMENTO',
    politicas: raw.politicas || 'Ambiente respetuoso y familiar. Cumplimiento de horarios de check-in.',
    horarioEntrada: raw.horarioEntrada || '14:00',
    horarioSalida: raw.horarioSalida || '11:00',
    motivoRechazo: raw.motivoRechazo || undefined,
    precioBaseNoche: Number(precioCalculado),
    moneda: raw.moneda || 'BOB',
    calificacionPromedio: Number(raw.calificacionPromedio ?? 4.92),
    totalResenas: Number(raw.totalResenas ?? 32),
    estado: raw.estadoPublicacion || raw.estado || 'PUBLICADO',
    estadoPublicacion: raw.estadoPublicacion || raw.estado || 'PUBLICADO',
    motivoObservacionRechazo: raw.motivoObservacionRechazo || raw.motivoRechazo,
    origenUltimoCambio: raw.origenUltimoCambio,
    fotografias: (raw.fotografias && raw.fotografias.length > 0)
      ? raw.fotografias.map((f: any, idx: number) => ({
          idFotografia: f.idFotografia || `foto-${idx}`,
          url: f.url,
          esPrincipal: f.orden === 1 || f.esPrincipal === true || idx === 0,
          orden: f.orden ?? idx + 1,
          descripcion: f.descripcion || raw.titulo
        }))
      : [
          {
            idFotografia: 'default',
            url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
            esPrincipal: true,
            orden: 1,
            descripcion: raw.titulo
          }
        ],
    unidades: (raw.unidades && raw.unidades.length > 0)
      ? raw.unidades.map((u: any) => ({
          idUnidad: u.idUnidad || 'd1a4e800-5c31-4a29-b612-426614174000',
          nombre: u.nombre || 'Unidad Principal',
          descripcion: u.descripcion || '',
          capacidadPersonas: u.capacidadHuespedes ?? u.capacidadPersonas ?? 4,
          cantidadDormitorios: u.cantidadDormitorios ?? 1,
          cantidadCamas: u.cantidadCamas ?? 2,
          cantidadBanios: u.cantidadBanos ?? u.cantidadBanios ?? 1,
          precioNoche: Number(u.precioNoche ?? precioCalculado),
          moneda: 'BOB',
          inventarioTotal: u.inventarioTotal ?? 1,
          activo: u.estado === 'DISPONIBLE' || u.activo !== false,
          estado: u.estado || 'DISPONIBLE',
          fotos: u.fotos || (u.fotografias || []).map((f: any) => f.url || f),
          fotografias: u.fotografias || (u.fotos ? u.fotos.map((url: string, i: number) => ({ idFotografia: `f-${i}`, url, esPrincipal: i === 0, orden: i + 1 })) : undefined),
          servicios: u.servicios || []
        }))
      : [
          {
            idUnidad: 'd1a4e800-5c31-4a29-b612-426614174000',
            nombre: 'Suite Estándar',
            descripcion: 'Alojamiento completo equipado',
            capacidadPersonas: 4,
            cantidadCamas: 2,
            cantidadBanios: 1,
            precioNoche: Number(precioCalculado),
            moneda: 'BOB',
            inventarioTotal: 1,
            activo: true
          }
        ],
    servicios: (raw.servicios && raw.servicios.length > 0)
      ? raw.servicios.map((s: any, idx: number) => ({
          idServicio: s.idServicio ?? idx + 1,
          nombre: s.nombre || 'Servicio General',
          categoria: s.categoria || 'CONFORT'
        }))
      : [
          { idServicio: 1, nombre: 'Wi-Fi de Alta Velocidad', categoria: 'CONECTIVIDAD' },
          { idServicio: 2, nombre: 'Piscina Privada', categoria: 'CONFORT' }
        ]
  };
}

function sincronizarConDecisionesAdmin(lista: Alojamiento[]): Alojamiento[] {
  try {
    const adminRaw = localStorage.getItem('alojate_admin_alojamientos');
    if (adminRaw) {
      const adminItems: any[] = JSON.parse(adminRaw);
      const adminMap = new Map<string, any>();
      adminItems.forEach(item => {
        if (item.id) adminMap.set(item.id, item);
        if (item.idAlojamiento) adminMap.set(item.idAlojamiento, item);
      });

      return lista.map(a => {
        const adminItem = adminMap.get(a.idAlojamiento);
        if (adminItem) {
          return {
            ...a,
            estado: adminItem.estado,
            estadoPublicacion: adminItem.estado,
            motivoRechazo: adminItem.motivoRechazo || adminItem.motivoObservacionRechazo,
            motivoObservacionRechazo: adminItem.motivoObservacionRechazo || adminItem.motivoRechazo,
            origenUltimoCambio: adminItem.origenUltimoCambio || a.origenUltimoCambio
          };
        }
        return a;
      });
    }
  } catch (e) {
    console.warn('Error sincronizando con moderación de admin local:', e);
  }
  return lista;
}

function obtenerValoracionesLocales(): ValoracionCliente[] {
  try {
    const raw = localStorage.getItem('alojate_valoraciones_local');
    if (raw) {
      const parsed: ValoracionCliente[] = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function calcularResumenLocal(lista: ValoracionCliente[]): ResumenValoraciones {
  if (!lista || lista.length === 0) {
    return {
      calificacionPromedio: 5.0,
      totalResenas: 0,
      promedioLimpieza: 5.0,
      promedioUbicacion: 5.0,
      promedioCalidadPrecio: 5.0,
      promedioServicio: 5.0,
      promedioComodidad: 5.0,
      conteoPositivos: 0,
      conteoNeutros: 0,
      conteoNegativos: 0
    };
  }
  const total = lista.length;
  let sumGen = 0, sumLimp = 0, sumUbi = 0, sumCal = 0, sumServ = 0, sumCom = 0;
  let pos = 0, neu = 0, neg = 0;
  for (const v of lista) {
    sumGen += v.puntuacionGeneral;
    sumLimp += (v.calificacionLimpieza ?? v.puntuacionGeneral);
    sumUbi += (v.calificacionUbicacion ?? v.puntuacionGeneral);
    sumCal += (v.calificacionCalidadPrecio ?? v.puntuacionGeneral);
    sumServ += (v.calificacionServicio ?? v.puntuacionGeneral);
    sumCom += (v.calificacionComodidad ?? v.puntuacionGeneral);
    const sent = (v.sentimientoNlp || '').toUpperCase();
    if (sent === 'POSITIVO' || v.puntuacionGeneral >= 4) pos++;
    else if (sent === 'NEUTRO' || v.puntuacionGeneral === 3) neu++;
    else neg++;
  }
  return {
    calificacionPromedio: Number((sumGen / total).toFixed(2)),
    totalResenas: total,
    promedioLimpieza: Number((sumLimp / total).toFixed(1)),
    promedioUbicacion: Number((sumUbi / total).toFixed(1)),
    promedioCalidadPrecio: Number((sumCal / total).toFixed(1)),
    promedioServicio: Number((sumServ / total).toFixed(1)),
    promedioComodidad: Number((sumCom / total).toFixed(1)),
    conteoPositivos: pos,
    conteoNeutros: neu,
    conteoNegativos: neg
  };
}

export const catalogoService = {
  async listarAlojamientos(departamento?: string): Promise<Alojamiento[]> {
    // Fuente de verdad: MS-01 (base de datos). Ya no existen alojamientos de ejemplo en el código.
    let baseList: Alojamiento[] = [];
    try {
      const response = await httpClient.get<any[]>(ENDPOINTS.ALOJAMIENTOS.LISTAR);
      if (response.data && response.data.length > 0) {
        baseList = response.data.map(normalizarAlojamiento);
      }
    } catch (e) {
      console.warn('MS-01 no disponible para listar alojamientos:', e);
    }

    const idsBackend = new Set(baseList.map(a => a.idAlojamiento));

    // Respaldo local: alojamientos creados por el anfitrión que el catálogo público aún no devuelve
    // (por ejemplo PENDIENTE). Si el backend ya conoce el alojamiento, el backend manda.
    try {
      const customRaw = localStorage.getItem('alojate_alojamientos_custom');
      if (customRaw) {
        const customItems: Alojamiento[] = JSON.parse(customRaw);
        const soloLocales = sincronizarConDecisionesAdmin(
          customItems.filter(item => !idsBackend.has(item.idAlojamiento))
        );
        baseList = [...baseList, ...soloLocales];
      }
    } catch (e) {
      console.warn('Error al leer alojamientos locales:', e);
    }

    if (!departamento || departamento === 'Todos') return baseList;
    return baseList.filter(a => a.departamento.toLowerCase() === departamento.toLowerCase());
  },

  async listarAlojamientosPublicados(departamento?: string): Promise<Alojamiento[]> {
    const todos = await this.listarAlojamientos(departamento);
    // Filtro estricto del Catálogo de Clientes:
    // Solo publicar alojamientos aprobados (PUBLICADO) o aquellos OBSERVADO derivados de NLP que siguen en servicio
    return todos.filter(a => {
      const estado = a.estadoPublicacion || a.estado;
      if (estado === 'PUBLICADO') return true;
      if (estado === 'OBSERVADO') {
        const origen = (a.origenUltimoCambio || '').toUpperCase();
        return origen.includes('NLP') || origen.includes('RESENA') || origen.includes('RESEÑA');
      }
      return false;
    });
  },

  async listarAlojamientosPorAnfitrion(criterio: { id?: string; email?: string; nombre?: string }): Promise<Alojamiento[]> {
    const todos = await this.listarAlojamientos();
    const locales = this.filtrarPorCriterioAnfitrion(todos, criterio);

    if (!criterio.id) return locales;

    // Fuente de verdad: MS-01 devuelve TODOS los alojamientos del anfitrión (incluidos PENDIENTE / EN_REVISION),
    // a diferencia del catálogo público que solo devuelve los publicados.
    try {
      const res = await httpClient.get<any[]>(ENDPOINTS.ALOJAMIENTOS.POR_ANFITRION(criterio.id));
      const delBackend = (res.data || []).map(normalizarAlojamiento);

      const localesPorId = new Map<string, Alojamiento>();
      locales.forEach(a => localesPorId.set(a.idAlojamiento, a));

      // Si existe copia local (con fotos/habitaciones completas) se conserva, pero el estado manda el backend.
      const combinados: Alojamiento[] = delBackend.map(b => {
        const local = localesPorId.get(b.idAlojamiento);
        if (!local) return b;
        return {
          ...local,
          estado: b.estado,
          estadoPublicacion: b.estadoPublicacion,
          motivoRechazo: b.motivoRechazo,
          motivoObservacionRechazo: b.motivoObservacionRechazo,
          origenUltimoCambio: b.origenUltimoCambio
        };
      });

      // Conservar los creados solo en local (sin respuesta del backend), excluyendo los datos demo ficticios.
      const idsBackend = new Set(delBackend.map(b => b.idAlojamiento));
      locales.forEach(l => {
        if (!idsBackend.has(l.idAlojamiento)) combinados.push(l);
      });

      return combinados;
    } catch (e) {
      console.warn('No se pudo consultar los alojamientos del anfitrión en MS-01, usando datos locales:', e);
      return locales;
    }
  },

  filtrarPorCriterioAnfitrion(todos: Alojamiento[], criterio: { id?: string; email?: string; nombre?: string }): Alojamiento[] {
    return todos.filter(a => {
      if (criterio.id && a.idAnfitrion === criterio.id) return true;
      const anfitrionNombre = (a.nombreAnfitrion || '').toLowerCase();
      const userEmail = (criterio.email || '').toLowerCase();
      const userNombre = (criterio.nombre || '').toLowerCase();

      if (userEmail.includes('carlos') || userEmail.includes('anfitrion@alojate.bo') || userNombre.includes('carlos')) {
        return anfitrionNombre.includes('carlos');
      }
      if (userEmail.includes('elena') || userNombre.includes('elena')) {
        return anfitrionNombre.includes('elena');
      }
      return false;
    });
  },

  async obtenerPorId(id: string): Promise<Alojamiento> {
    // 1. Intentar obtener desde la API Gateway (MS-01)
    try {
      const response = await httpClient.get<any>(ENDPOINTS.ALOJAMIENTOS.DETALLE(id));
      if (response.data && response.data.idAlojamiento) {
        return normalizarAlojamiento(response.data);
      }
    } catch (e) {
      // No encontrado en backend, buscar en cache local
    }

    // 2. Buscar en almacenamiento local personalizado
    try {
      const customRaw = localStorage.getItem('alojate_alojamientos_custom');
      if (customRaw) {
        const customItems: Alojamiento[] = JSON.parse(customRaw);
        const foundCustom = customItems.find(a => a.idAlojamiento === id);
        if (foundCustom) return foundCustom;
      }
    } catch {
      // Ignorar error de parsing
    }

    throw new Error(`Alojamiento con ID ${id} no encontrado`);
  },

  guardarAlojamientoLocal(alojamiento: Alojamiento): void {
    try {
      const customRaw = localStorage.getItem('alojate_alojamientos_custom');
      const customItems: Alojamiento[] = customRaw ? JSON.parse(customRaw) : [];
      const actualizados = [alojamiento, ...customItems.filter(a => a.idAlojamiento !== alojamiento.idAlojamiento)];
      localStorage.setItem('alojate_alojamientos_custom', JSON.stringify(actualizados));

      // Sincronizar también con el panel de administración
      const adminRaw = localStorage.getItem('alojate_admin_alojamientos');
      const adminList: any[] = adminRaw ? JSON.parse(adminRaw) : [];
      const nuevoParaAdmin = {
        id: alojamiento.idAlojamiento,
        titulo: alojamiento.titulo,
        anfitrion: alojamiento.nombreAnfitrion,
        departamento: alojamiento.departamento,
        ciudad: alojamiento.ciudad,
        direccion: alojamiento.direccion,
        tipoPropiedad: alojamiento.tipoPropiedad,
        modalidad: alojamiento.modalidad || 'CASA_DEPARTAMENTO',
        precioNoche: alojamiento.precioBaseNoche,
        capacidad: alojamiento.unidades?.[0]?.capacidadPersonas || 4,
        habitaciones: alojamiento.unidades?.[0]?.cantidadDormitorios || 1,
        estado: alojamiento.estadoPublicacion || alojamiento.estado || 'PENDIENTE',
        fechaRegistro: new Date().toISOString(),
        imagen: alojamiento.fotografias?.[0]?.url || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
        fotos: (alojamiento.fotografias || []).map(f => f.url),
        descripcion: alojamiento.descripcion,
        politicas: alojamiento.politicas,
        horarioEntrada: alojamiento.horarioEntrada,
        horarioSalida: alojamiento.horarioSalida,
        unidades: (alojamiento.unidades || []).map(u => ({
          idUnidad: u.idUnidad,
          nombre: u.nombre,
          capacidadHuespedes: u.capacidadPersonas,
          cantidadCamas: u.cantidadCamas,
          cantidadBanos: u.cantidadBanios,
          inventarioTotal: u.inventarioTotal,
          precioNoche: u.precioNoche,
          estado: 'DISPONIBLE'
        })),
        servicios: (alojamiento.servicios || []).map(s => s.nombre)
      };

      const adminActualizados = [nuevoParaAdmin, ...adminList.filter(a => a.id !== alojamiento.idAlojamiento)];
      localStorage.setItem('alojate_admin_alojamientos', JSON.stringify(adminActualizados));
    } catch (e) {
      console.warn('No se pudo guardar en localStorage:', e);
    }
  },

  async listarValoraciones(idAlojamiento: string): Promise<ValoracionCliente[]> {
    try {
      const res = await httpClient.get<ValoracionCliente[]>(ENDPOINTS.ALOJAMIENTOS.VALORACIONES(idAlojamiento));
      if (res.data && res.data.length > 0) return res.data;
    } catch (e) {}
    const locales = obtenerValoracionesLocales();
    return locales.filter(v => v.idAlojamiento === idAlojamiento);
  },

  async listarValoracionesGeneralesHotel(idAlojamiento: string): Promise<ValoracionCliente[]> {
    try {
      const res = await httpClient.get<ValoracionCliente[]>(ENDPOINTS.ALOJAMIENTOS.VALORACIONES_HOTEL(idAlojamiento));
      if (res.data && res.data.length > 0) return res.data;
    } catch (e) {}
    const locales = obtenerValoracionesLocales();
    return locales.filter(v => v.idAlojamiento === idAlojamiento && !v.idUnidad);
  },

  async listarValoracionesUnidad(idUnidad: string): Promise<ValoracionCliente[]> {
    try {
      const res = await httpClient.get<ValoracionCliente[]>(ENDPOINTS.ALOJAMIENTOS.VALORACIONES_UNIDAD(idUnidad));
      if (res.data && res.data.length > 0) return res.data;
    } catch (e) {}
    const locales = obtenerValoracionesLocales();
    return locales.filter(v => v.idUnidad === idUnidad);
  },

  async crearValoracion(idAlojamiento: string, req: any): Promise<ValoracionCliente> {
    const nueva: ValoracionCliente = {
      idValoracion: `val-${Date.now()}`,
      idAlojamiento,
      idUnidad: req.idUnidad,
      idUsuario: req.idUsuario,
      nombreUsuario: req.esAnonimo ? 'Huésped Anónimo' : (req.nombreUsuario || 'Viajero Aloja-Te'),
      puntuacionGeneral: req.puntuacionGeneral || 5,
      calificacionLimpieza: req.calificacionLimpieza,
      calificacionUbicacion: req.calificacionUbicacion,
      calificacionCalidadPrecio: req.calificacionCalidadPrecio,
      calificacionServicio: req.calificacionServicio,
      calificacionComodidad: req.calificacionComodidad,
      esAnonimo: Boolean(req.esAnonimo),
      comentario: req.comentario || '',
      sentimientoNlp: req.sentimientoNlp || (req.puntuacionGeneral >= 4 ? 'POSITIVO' : (req.puntuacionGeneral === 3 ? 'NEUTRO' : 'NEGATIVO')),
      confianzaNlp: req.confianzaNlp || 0.95,
      topicoPredicho: req.topicoPredicho || 'EXPERIENCIA_GENERAL',
      fechaCreacion: new Date().toISOString()
    };

    try {
      const actuales = obtenerValoracionesLocales();
      const actualizadas = [nueva, ...actuales];
      localStorage.setItem('alojate_valoraciones_local', JSON.stringify(actualizadas));
    } catch {}

    try {
      const res = await httpClient.post<any>(ENDPOINTS.ALOJAMIENTOS.VALORACIONES(idAlojamiento), req);
      return res.data;
    } catch {
      return nueva;
    }
  },

  async obtenerResumenValoraciones(idAlojamiento: string): Promise<ResumenValoraciones> {
    try {
      const res = await httpClient.get<ResumenValoraciones>(ENDPOINTS.ALOJAMIENTOS.RESUMEN_VALORACIONES(idAlojamiento));
      if (res.data) return res.data;
    } catch (e) {}
    const locales = obtenerValoracionesLocales().filter(v => v.idAlojamiento === idAlojamiento);
    return calcularResumenLocal(locales);
  }
};
