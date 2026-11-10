import { httpClient } from '../../../core/api/httpClient';
import { ENDPOINTS } from '../../../core/api/apiEndpoints';
import { Alojamiento, ValoracionCliente, ResumenValoraciones } from '../types/catalogo.types';

// Dataset inicial limpio
const ALOJAMIENTOS_DEMO: Alojamiento[] = [];

// Normalizador para armonizar el DTO de Spring Boot con el frontend
function normalizarAlojamiento(raw: any): Alojamiento {
  const unidadPrincipal = raw.unidades?.[0];
  const precioCalculado = raw.precioBaseNoche ?? raw.precioNoche ?? unidadPrincipal?.precioNoche ?? 650;
  const canonicalId = raw.idAlojamiento || raw.id || `aloj-${Date.now()}`;
  const canonicalAnfitrionId = raw.idAnfitrion || raw.anfitrionId || 'a0000000-0000-4000-8000-000000000002';
  const canonicalNombreAnfitrion = raw.nombreAnfitrion || raw.anfitrion || 'Carlos Mendoza';

  return {
    idAlojamiento: canonicalId,
    idAnfitrion: canonicalAnfitrionId,
    nombreAnfitrion: canonicalNombreAnfitrion,
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
          idFotografia: f.idFotografia || f.id || `foto-${idx}`,
          url: f.url,
          esPrincipal: f.orden === 1 || f.esPrincipal === true || idx === 0,
          orden: f.orden ?? idx + 1,
          descripcion: f.descripcion || raw.titulo
        }))
      : [
          {
            idFotografia: 'default',
            url: raw.imagen || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
            esPrincipal: true,
            orden: 1,
            descripcion: raw.titulo
          }
        ],
    unidades: (raw.unidades && raw.unidades.length > 0)
      ? raw.unidades.map((u: any) => ({
          idUnidad: u.idUnidad || u.id || 'd1a4e800-5c31-4a29-b612-426614174000',
          nombre: u.nombre || 'Unidad Principal',
          descripcion: u.descripcion || '',
          capacidadPersonas: u.capacidadHuespedes ?? u.capacidadPersonas ?? u.capacidad ?? 4,
          cantidadDormitorios: u.cantidadDormitorios ?? u.habitaciones ?? 1,
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
            activo: true,
            estado: 'DISPONIBLE',
            fotos: [
              raw.imagen || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'
            ],
            servicios: ['Wi-Fi Starlink', 'Climatización', 'Desayuno Incluido']
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

// =========================================================================
// VALORACIONES CANÓNICAS Y ANÁLISIS DE TÓPICOS NLP
// =========================================================================
export const VALORACIONES_DEMO: ValoracionCliente[] = [];

function obtenerValoracionesLocales(): ValoracionCliente[] {
  try {
    const raw = localStorage.getItem('alojate_valoraciones_local');
    if (raw) {
      const parsed: ValoracionCliente[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const ids = new Set(parsed.map(p => p.idValoracion));
        const combinadas = [...parsed];
        VALORACIONES_DEMO.forEach(v => {
          if (!ids.has(v.idValoracion)) combinadas.push(v);
        });
        return combinadas;
      }
    }
  } catch {}
  return [...VALORACIONES_DEMO];
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
    let baseList: Alojamiento[] = [];
    try {
      // 1. Intentar obtener el conjunto completo de alojamientos en tiempo real desde el Gateway
      const resTodos = await httpClient.get<any[]>(ENDPOINTS.ALOJAMIENTOS.TODOS);
      if (resTodos.data && resTodos.data.length > 0) {
        baseList = resTodos.data.map(normalizarAlojamiento);
      }
    } catch {
      // Fallback a listar publicados si el endpoint todos no está disponible
    }

    if (baseList.length === 0) {
      try {
        const response = await httpClient.get<any[]>(ENDPOINTS.ALOJAMIENTOS.LISTAR);
        if (response.data && response.data.length > 0) {
          baseList = response.data.map(normalizarAlojamiento);
        }
      } catch {
        baseList = [];
      }
    }

    if (baseList.length === 0) {
      return [];
    }

    // Agregar alojamientos personalizados creados por el anfitrión (persistencia local)
    // Regla de Integridad: Si el servidor ya tiene el alojamiento con un estado actualizado
    // (p. ej. el administrador lo cambió de PENDIENTE a PUBLICADO u OBSERVADO), se respeta la decisión del servidor.
    try {
      const customRaw = localStorage.getItem('alojate_alojamientos_custom');
      if (customRaw) {
        const customItems: Alojamiento[] = JSON.parse(customRaw);
        const map = new Map<string, Alojamiento>();
        baseList.forEach(item => map.set(item.idAlojamiento, item));
        
        customItems.forEach(item => {
          const existente = map.get(item.idAlojamiento);
          if (existente) {
            // Sincronizar: conservar fotografías y detalles del draft local pero tomar el estado oficial del servidor
            map.set(item.idAlojamiento, {
              ...item,
              estado: existente.estadoPublicacion || existente.estado || item.estado,
              estadoPublicacion: existente.estadoPublicacion || existente.estado || item.estadoPublicacion,
              motivoRechazo: existente.motivoRechazo || item.motivoRechazo,
              motivoObservacionRechazo: existente.motivoObservacionRechazo || item.motivoObservacionRechazo,
              origenUltimoCambio: existente.origenUltimoCambio || item.origenUltimoCambio
            });
          } else {
            map.set(item.idAlojamiento, item);
          }
        });
        baseList = Array.from(map.values());
      }
    } catch (e) {
      console.warn('Error al leer alojamientos locales:', e);
    }

    // Sincronizar con decisiones administrativas tomadas en el panel de control
    baseList = sincronizarConDecisionesAdmin(baseList);

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

    // 1. Obtener IDs y alojamientos creados localmente en el draft del cliente
    const customIds = new Set<string>();
    try {
      const customRaw = localStorage.getItem('alojate_alojamientos_custom');
      if (customRaw) {
        const customItems: Alojamiento[] = JSON.parse(customRaw);
        customItems.forEach(c => {
          if (c.idAlojamiento) customIds.add(c.idAlojamiento);
        });
      }
    } catch {}

    // 2. Intentar consultar endpoint dedicado del gateway por anfitrión si hay ID
    let remotosPorAnfitrionMap = new Map<string, Alojamiento>();
    if (criterio.id) {
      try {
        const res = await httpClient.get<any[]>(ENDPOINTS.ALOJAMIENTOS.ANFITRION(criterio.id));
        if (Array.isArray(res.data) && res.data.length > 0) {
          res.data.map(normalizarAlojamiento).forEach(item => {
            remotosPorAnfitrionMap.set(item.idAlojamiento, item);
          });
        }
      } catch {}
    }

    const filtrados = todos.filter(a => {
      // Prioridad 1: Si fue creado en esta sesión / cliente local, siempre pertenece al anfitrión
      if (customIds.has(a.idAlojamiento)) return true;

      // Prioridad 2: Si vino de la consulta directa por idAnfitrion del Gateway
      if (remotosPorAnfitrionMap.has(a.idAlojamiento)) return true;

      // Prioridad 3: Si coincide por ID exacto de usuario o ID canónico demo
      if (criterio.id) {
        if (a.idAnfitrion === criterio.id) return true;
        if (
          (criterio.id === 'anf-carlos' || criterio.id === 'a0000000-0000-4000-8000-000000000002') &&
          (a.idAnfitrion === 'a0000000-0000-4000-8000-000000000002' || a.idAnfitrion === 'anf-carlos')
        ) {
          return true;
        }
        if (
          (criterio.id === 'anf-elena' || criterio.id === 'a0000000-0000-4000-8000-000000000003') &&
          (a.idAnfitrion === 'a0000000-0000-4000-8000-000000000003' || a.idAnfitrion === 'anf-elena')
        ) {
          return true;
        }
      }

      // Prioridad 4: Si coincide por Correo o Nombre
      const anfitrionNombre = (a.nombreAnfitrion || '').toLowerCase();
      const userEmail = (criterio.email || '').toLowerCase();
      const userNombre = (criterio.nombre || '').toLowerCase();

      if (userEmail.includes('carlos') || userEmail.includes('anfitrion@alojate.bo') || userNombre.includes('carlos')) {
        return (
          anfitrionNombre.includes('carlos') ||
          !a.idAnfitrion ||
          a.idAnfitrion === 'a0000000-0000-4000-8000-000000000002' ||
          a.idAnfitrion === 'anf-carlos'
        );
      }
      if (userEmail.includes('elena') || userNombre.includes('elena')) {
        return (
          anfitrionNombre.includes('elena') ||
          a.idAnfitrion === 'a0000000-0000-4000-8000-000000000003' ||
          a.idAnfitrion === 'anf-elena'
        );
      }
      if (userNombre && anfitrionNombre.includes(userNombre)) {
        return true;
      }
      return false;
    });

    // Asegurar que si remotosPorAnfitrionMap trajo elementos no presentes en todos, se incluyan
    const resultadoMap = new Map<string, Alojamiento>();
    filtrados.forEach(f => resultadoMap.set(f.idAlojamiento, f));
    remotosPorAnfitrionMap.forEach((val, key) => {
      if (!resultadoMap.has(key)) {
        resultadoMap.set(key, val);
      }
    });

    return Array.from(resultadoMap.values());
  },

  async obtenerPorId(id: string): Promise<Alojamiento> {
    // 1. Intentar obtener desde la API Gateway (MS-01)
    try {
      const response = await httpClient.get<any>(ENDPOINTS.ALOJAMIENTOS.DETALLE(id));
      if (response.data && response.data.idAlojamiento) {
        return normalizarAlojamiento(response.data);
      }
    } catch (e) {
      // No encontrado en backend, buscar en cache local o demo
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

    // 3. Buscar en dataset demo sembrado
    const found = ALOJAMIENTOS_DEMO.find(a => a.idAlojamiento === id);
    if (found) return found;

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
        imagen: (alojamiento.fotografias || []).find(f => f.esPrincipal)?.url || alojamiento.fotografias?.[0]?.url || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
        fotos: (alojamiento.fotografias || []).map(f => f.url),
        fotografias: alojamiento.fotografias,
        descripcion: alojamiento.descripcion,
        politicas: alojamiento.politicas,
        horarioEntrada: alojamiento.horarioEntrada,
        horarioSalida: alojamiento.horarioSalida,
        unidades: (alojamiento.unidades || []).map(u => {
          const uFotos = (u.fotos && u.fotos.length > 0)
            ? u.fotos
            : (u.fotografias || []).map(f => f.url).filter(Boolean);
          return {
            idUnidad: u.idUnidad,
            nombre: u.nombre,
            descripcion: u.descripcion || '',
            capacidadHuespedes: u.capacidadPersonas,
            cantidadCamas: u.cantidadCamas,
            cantidadBanos: u.cantidadBanios || u.cantidadBanos || 1,
            inventarioTotal: u.inventarioTotal,
            precioNoche: u.precioNoche,
            estado: 'DISPONIBLE',
            fotos: uFotos,
            fotografias: u.fotografias || uFotos.map((url, i) => ({
              idFotografia: `fhab-${u.idUnidad}-${i}`,
              url,
              esPrincipal: i === 0,
              orden: i + 1
            }))
          };
        }),
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

  async clasificarResenaNLP(texto: string, idAlojamiento?: string, idUnidad?: string, puntuacion?: number) {
    try {
      const res = await httpClient.post<any>(ENDPOINTS.IA.CLASIFICAR_RESENA, {
        texto,
        idAlojamiento,
        idUnidad,
        puntuacionGeneral: puntuacion
      });
      return res.data;
    } catch (e) {
      console.warn('[NLP Service] Error al clasificar:', e);
      return null;
    }
  },

  async crearValoracion(idAlojamiento: string, req: any): Promise<ValoracionCliente> {
    let sentimientoCalculado = req.sentimientoNlp;
    let confianzaCalculada = req.confianzaNlp;
    let topicoCalculado = req.topicoPredicho;

    // Conexión directa con el Microservicio de IA (NLP Review Classifier)
    if (req.comentario && req.comentario.trim().length >= 3) {
      try {
        const iaRes = await httpClient.post<any>(ENDPOINTS.IA.CLASIFICAR_RESENA, {
          texto: req.comentario.trim(),
          idAlojamiento,
          idUnidad: req.idUnidad,
          puntuacionGeneral: req.puntuacionGeneral
        });
        if (iaRes.data && iaRes.data.status === 'success') {
          sentimientoCalculado = iaRes.data.sentimiento;
          confianzaCalculada = iaRes.data.confianza;
          topicoCalculado = iaRes.data.topico;
        }
      } catch (iaError) {
        console.warn('[NLP Copiloto] Clasificación local/offline aplicada:', iaError);
      }
    }

    if (!sentimientoCalculado) {
      sentimientoCalculado = req.puntuacionGeneral >= 4 ? 'POSITIVO' : (req.puntuacionGeneral === 3 ? 'NEUTRO' : 'NEGATIVO');
    }
    if (!confianzaCalculada) {
      confianzaCalculada = 0.92;
    }
    if (!topicoCalculado) {
      topicoCalculado = 'EXPERIENCIA_GENERAL';
    }

    const payloadBackend = {
      ...req,
      sentimientoNlp: sentimientoCalculado,
      confianzaNlp: confianzaCalculada,
      topicoPredicho: topicoCalculado
    };

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
      sentimientoNlp: sentimientoCalculado,
      confianzaNlp: confianzaCalculada,
      topicoPredicho: topicoCalculado,
      fechaCreacion: new Date().toISOString()
    };

    try {
      const actuales = obtenerValoracionesLocales();
      const actualizadas = [nueva, ...actuales];
      localStorage.setItem('alojate_valoraciones_local', JSON.stringify(actualizadas));
    } catch {}

    try {
      const res = await httpClient.post<any>(ENDPOINTS.ALOJAMIENTOS.VALORACIONES(idAlojamiento), payloadBackend);
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
