import { httpClient } from '../../../core/api/httpClient';
import { ENDPOINTS } from '../../../core/api/apiEndpoints';
import { Alojamiento, ValoracionCliente, ResumenValoraciones } from '../types/catalogo.types';

// Normalizador para armonizar el DTO de Spring Boot con el frontend
function normalizarAlojamiento(raw: any): Alojamiento {
  // Solo se reflejan datos reales de MS-01: si la base de datos no trae un valor, queda vacío o en 0,
  // sin inventar anfitriones, fotos, habitaciones, servicios ni calificaciones.
  const unidadPrincipal = raw.unidades?.[0];
  const precioCalculado = raw.precioBaseNoche ?? raw.precioNoche ?? unidadPrincipal?.precioNoche ?? 0;
  const estado = raw.estadoPublicacion || raw.estado || 'PENDIENTE';

  return {
    idAlojamiento: raw.idAlojamiento || raw.id || '',
    idAnfitrion: raw.idAnfitrion || raw.anfitrionId || '',
    nombreAnfitrion: raw.nombreAnfitrion || raw.anfitrion || undefined,
    titulo: raw.titulo || '',
    descripcion: raw.descripcion || '',
    departamento: raw.departamento || '',
    ciudad: raw.ciudad || '',
    direccion: raw.direccion || '',
    tipoPropiedad: raw.tipoPropiedadNombre || raw.tipoPropiedad || '',
    tipoEspacio: raw.tipoEspacioNombre || raw.tipoEspacio || undefined,
    modalidad: raw.modalidad || undefined,
    politicas: raw.politicas || undefined,
    horarioEntrada: raw.horarioEntrada || undefined,
    horarioSalida: raw.horarioSalida || undefined,
    motivoRechazo: raw.motivoRechazo || undefined,
    precioBaseNoche: Number(precioCalculado),
    moneda: raw.moneda || 'BOB',
    calificacionPromedio: Number(raw.calificacionPromedio ?? 0),
    totalResenas: Number(raw.totalResenas ?? 0),
    estado,
    estadoPublicacion: estado,
    motivoObservacionRechazo: raw.motivoObservacionRechazo || raw.motivoRechazo,
    origenUltimoCambio: raw.origenUltimoCambio,
    fotografias: (raw.fotografias || []).map((f: any, idx: number) => ({
      idFotografia: f.idFotografia || f.id || `foto-${idx}`,
      url: f.url,
      esPrincipal: f.orden === 1 || f.esPrincipal === true || idx === 0,
      orden: f.orden ?? idx + 1,
      descripcion: f.descripcion || raw.titulo
    })),
    unidades: (raw.unidades || []).map((u: any) => ({
      idUnidad: u.idUnidad || u.id || '',
      nombre: u.nombre || '',
      descripcion: u.descripcion || '',
      capacidadPersonas: u.capacidadHuespedes ?? u.capacidadPersonas ?? u.capacidad ?? 0,
      cantidadDormitorios: u.cantidadDormitorios ?? u.habitaciones ?? 0,
      cantidadCamas: u.cantidadCamas ?? 0,
      cantidadBanios: u.cantidadBanos ?? u.cantidadBanios ?? 0,
      precioNoche: Number(u.precioNoche ?? precioCalculado),
      moneda: u.moneda || raw.moneda || 'BOB',
      inventarioTotal: u.inventarioTotal ?? 0,
      activo: u.estado === 'DISPONIBLE' || u.activo !== false,
      estado: u.estado || 'DISPONIBLE',
      fotos: u.fotos || (u.fotografias || []).map((f: any) => f.url || f),
      fotografias: u.fotografias || (u.fotos ? u.fotos.map((url: string, i: number) => ({ idFotografia: `f-${i}`, url, esPrincipal: i === 0, orden: i + 1 })) : undefined),
      servicios: u.servicios || []
    })),
    servicios: (raw.servicios || []).map((s: any, idx: number) => ({
      idServicio: s.idServicio ?? idx + 1,
      nombre: s.nombre || '',
      categoria: s.categoria || ''
    }))
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
export const VALORACIONES_DEMO: ValoracionCliente[] = [
  // --- Hotel Boutique Los Tajibos Colonial (General) ---
  {
    idValoracion: 'val-taj-gen-1',
    idAlojamiento: '49768530-76ae-459e-9bbe-faf2f3d488ba',
    idUsuario: '075eabd5-7aca-4ec2-a00d-67064b8eccdf',
    nombreUsuario: 'Mateo Zalles',
    puntuacionGeneral: 5,
    calificacionLimpieza: 5,
    calificacionUbicacion: 5,
    calificacionCalidadPrecio: 4.8,
    calificacionServicio: 5,
    calificacionComodidad: 5,
    esAnonimo: false,
    comentario: 'Excelente atención en la recepción y los jardines con la piscina son hermosos. El desayuno buffet típico cruceño espectacular, volveremos siempre.',
    sentimientoNlp: 'POSITIVO',
    confianzaNlp: 0.96,
    topicoPredicho: 'AREAS_COMUNES_Y_DESAYUNO',
    fechaCreacion: '2026-10-24T10:15:00Z'
  },
  {
    idValoracion: 'val-taj-gen-2',
    idAlojamiento: '49768530-76ae-459e-9bbe-faf2f3d488ba',
    idUsuario: '3b892a01-51f2-4bc9-8800-47bf1b14a220',
    nombreUsuario: 'Camila Vaca',
    puntuacionGeneral: 4,
    calificacionLimpieza: 5,
    calificacionUbicacion: 5,
    calificacionCalidadPrecio: 4,
    calificacionServicio: 4.5,
    calificacionComodidad: 4,
    esAnonimo: false,
    comentario: 'Ubicación inmejorable en pleno Equipetrol, muy seguro y tranquilo. El personal de conserjería fue muy atento durante toda la estancia.',
    sentimientoNlp: 'POSITIVO',
    confianzaNlp: 0.91,
    topicoPredicho: 'UBICACION_Y_SEGURIDAD',
    fechaCreacion: '2026-10-21T18:30:00Z'
  },

  // --- Suite Presidencial con Balcón & Vista a Jardines (u-tajibos-1) ---
  {
    idValoracion: 'val-taj-u1-1',
    idAlojamiento: '49768530-76ae-459e-9bbe-faf2f3d488ba',
    idUnidad: 'u-tajibos-1',
    idUsuario: '6c1a8902-33dd-45ab-9912-78814aa88231',
    nombreUsuario: 'Roberto Fernández',
    puntuacionGeneral: 5,
    calificacionLimpieza: 5,
    calificacionUbicacion: 5,
    calificacionCalidadPrecio: 5,
    calificacionServicio: 5,
    calificacionComodidad: 5,
    esAnonimo: false,
    comentario: 'La suite es maravillosa, la tina de hidromasaje en mármol y la vista al jardín botánico valen cada centavo. Cama King super cómoda y silencio absoluto.',
    sentimientoNlp: 'POSITIVO',
    confianzaNlp: 0.98,
    topicoPredicho: 'CONFORT_Y_LUJO',
    fechaCreacion: '2026-10-26T14:20:00Z'
  },
  {
    idValoracion: 'val-taj-u1-2',
    idAlojamiento: '49768530-76ae-459e-9bbe-faf2f3d488ba',
    idUnidad: 'u-tajibos-1',
    idUsuario: '8f220199-77aa-42a1-bb00-112233445566',
    nombreUsuario: 'Sofía Banegas',
    puntuacionGeneral: 5,
    calificacionLimpieza: 5,
    calificacionUbicacion: 5,
    calificacionCalidadPrecio: 4.8,
    calificacionServicio: 5,
    calificacionComodidad: 5,
    esAnonimo: false,
    comentario: 'Inolvidable estadía de aniversario. El balcón privado hacia las palmeras y el room service fueron impecables. 100% recomendado.',
    sentimientoNlp: 'POSITIVO',
    confianzaNlp: 0.95,
    topicoPredicho: 'EXPERIENCIA_Y_VISTAS',
    fechaCreacion: '2026-10-27T11:00:00Z'
  },

  // --- Habitación Ejecutiva Doble Twin (u-tajibos-2) (CON RESEÑAS NEGATIVAS DETECTADAS POR IA NLP) ---
  {
    idValoracion: 'val-taj-u2-1',
    idAlojamiento: '49768530-76ae-459e-9bbe-faf2f3d488ba',
    idUnidad: 'u-tajibos-2',
    idUsuario: '99aa0011-22bb-43cc-88dd-776655443322',
    nombreUsuario: 'Javier Arnez',
    puntuacionGeneral: 2,
    calificacionLimpieza: 3,
    calificacionUbicacion: 4,
    calificacionCalidadPrecio: 2,
    calificacionServicio: 2,
    calificacionComodidad: 1,
    esAnonimo: false,
    comentario: 'El aire acondicionado hacía un ruido metálico ensordecedor toda la noche y apenas enfriaba. Tuvimos que abrir la ventana y entraron mosquitos, pésima noche de descanso.',
    sentimientoNlp: 'NEGATIVO',
    confianzaNlp: 0.94,
    topicoPredicho: 'CLIMATIZACION_Y_RUIDO',
    fechaCreacion: '2026-10-29T08:45:00Z'
  },
  {
    idValoracion: 'val-taj-u2-2',
    idAlojamiento: '49768530-76ae-459e-9bbe-faf2f3d488ba',
    idUnidad: 'u-tajibos-2',
    idUsuario: '55bb6677-88cc-49dd-a0ee-112233445577',
    nombreUsuario: 'Carla Mercado',
    puntuacionGeneral: 2,
    calificacionLimpieza: 4,
    calificacionUbicacion: 5,
    calificacionCalidadPrecio: 2,
    calificacionServicio: 2,
    calificacionComodidad: 2,
    esAnonimo: true,
    comentario: 'El agua de la ducha salía completamente fría en la mañana. Llamé a recepción y dijeron que el termotanque del bloque ejecutivo estaba en mantenimiento. Inaceptable para la tarifa que cobran.',
    sentimientoNlp: 'NEGATIVO',
    confianzaNlp: 0.92,
    topicoPredicho: 'AGUA_CALIENTE_Y_BANO',
    fechaCreacion: '2026-10-30T09:12:00Z'
  },
  {
    idValoracion: 'val-taj-u2-3',
    idAlojamiento: '49768530-76ae-459e-9bbe-faf2f3d488ba',
    idUnidad: 'u-tajibos-2',
    idUsuario: '11aa22bb-33cc-44dd-55ee-6677889900aa',
    nombreUsuario: 'Andrés Guidi',
    puntuacionGeneral: 3,
    calificacionLimpieza: 4,
    calificacionUbicacion: 4.5,
    calificacionCalidadPrecio: 3,
    calificacionServicio: 3.5,
    calificacionComodidad: 3,
    esAnonimo: false,
    comentario: 'El escritorio ejecutivo y el internet son buenos para trabajar, pero deberían revisar el aislamiento acústico y el clima de estas habitaciones.',
    sentimientoNlp: 'NEUTRO',
    confianzaNlp: 0.82,
    topicoPredicho: 'EQUIPAMIENTO_Y_TRABAJO',
    fechaCreacion: '2026-10-30T17:00:00Z'
  },

  // --- Lodge Mirador del Illimani (ea199203-91aa-42a1-bf00-881273918a22 - OBSERVADO POR NLP) ---
  {
    idValoracion: 'val-illi-1',
    idAlojamiento: 'ea199203-91aa-42a1-bf00-881273918a22',
    idUsuario: '44cc55dd-66ee-47ff-88aa-99bb00112233',
    nombreUsuario: 'Diego Morales',
    puntuacionGeneral: 2,
    calificacionLimpieza: 4,
    calificacionUbicacion: 4.5,
    calificacionCalidadPrecio: 2,
    calificacionServicio: 3,
    calificacionComodidad: 1.5,
    esAnonimo: false,
    comentario: 'La vista al majestuoso nevado Illimani es insuperable, pero por la noche la estufa a leña no dio abasto y pasamos un frío extremo en el dormitorio. No había frazadas térmicas suficientes.',
    sentimientoNlp: 'NEGATIVO',
    confianzaNlp: 0.96,
    topicoPredicho: 'TEMPERATURA_Y_CALEFACCION',
    fechaCreacion: '2026-10-17T22:30:00Z'
  },
  {
    idValoracion: 'val-illi-2',
    idAlojamiento: 'ea199203-91aa-42a1-bf00-881273918a22',
    idUsuario: '77dd88ee-99ff-40aa-bb11-223344556677',
    nombreUsuario: 'Valeria Soliz',
    puntuacionGeneral: 3,
    calificacionLimpieza: 4,
    calificacionUbicacion: 5,
    calificacionCalidadPrecio: 3,
    calificacionServicio: 4,
    calificacionComodidad: 2.5,
    esAnonimo: false,
    comentario: 'Lugar mágico para desconectar de la ciudad, pero vengan muy preparados para las bajas temperaturas porque las noches son realmente heladas en Mecapaca.',
    sentimientoNlp: 'NEUTRO',
    confianzaNlp: 0.88,
    topicoPredicho: 'CLIMA_Y_TEMPERATURA',
    fechaCreacion: '2026-10-18T07:15:00Z'
  },

  // --- Chalet Boutique Los Viñedos (ca4d2e81-7b90-41f2-9854-1b3a88c22110) ---
  {
    idValoracion: 'val-tari-1',
    idAlojamiento: 'ca4d2e81-7b90-41f2-9854-1b3a88c22110',
    idUsuario: '88ee99ff-00aa-41bb-cc22-334455667788',
    nombreUsuario: 'Sebastián Farfán',
    puntuacionGeneral: 5,
    calificacionLimpieza: 5,
    calificacionUbicacion: 5,
    calificacionCalidadPrecio: 5,
    calificacionServicio: 5,
    calificacionComodidad: 5,
    esAnonimo: false,
    comentario: 'Una de las mejores experiencias en Tarija. El viñedo privado, la cata de vinos guiada y el desayuno chapaco fueron de diez. Doña Elena es una anfitriona de primer nivel.',
    sentimientoNlp: 'POSITIVO',
    confianzaNlp: 0.97,
    topicoPredicho: 'HOSPITALIDAD_Y_VINOS',
    fechaCreacion: '2026-10-23T16:00:00Z'
  },

  // --- Cabaña Chiquitana El Palmar (93fce18e-32fa-400c-8f49-8d4f2fe2f5bb) ---
  {
    idValoracion: 'val-chiqui-1',
    idAlojamiento: '93fce18e-32fa-400c-8f49-8d4f2fe2f5bb',
    idUsuario: '22ff33aa-44bb-42cc-dd33-445566778899',
    nombreUsuario: 'Mariana Roca',
    puntuacionGeneral: 5,
    calificacionLimpieza: 5,
    calificacionUbicacion: 4.8,
    calificacionCalidadPrecio: 5,
    calificacionServicio: 5,
    calificacionComodidad: 5,
    esAnonimo: false,
    comentario: 'Hermosa cabaña en San José de Chiquitos, la galería con hamacas y la piscina privada son perfectas para desconectarse en familia bajo el cielo estrellado.',
    sentimientoNlp: 'POSITIVO',
    confianzaNlp: 0.95,
    topicoPredicho: 'DESCANSO_Y_FAMILIA',
    fechaCreacion: '2026-10-26T20:00:00Z'
  }
];

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
      } catch (e) {
        console.warn('MS-01 no disponible para listar alojamientos:', e);
      }
    }

    // Fuente de verdad: MS-01 (base de datos). No existen alojamientos de ejemplo en el código.
    const idsBackend = new Set(baseList.map(a => a.idAlojamiento));

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

    // Las decisiones administrativas guardadas en el navegador solo se aplican a alojamientos que el
    // backend no conoce (copias locales). Para los demás, el estado oficial es el de la base de datos.
    baseList = [
      ...baseList.filter(a => idsBackend.has(a.idAlojamiento)),
      ...sincronizarConDecisionesAdmin(baseList.filter(a => !idsBackend.has(a.idAlojamiento)))
    ];

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
      const res = await httpClient.get<any[]>(ENDPOINTS.ALOJAMIENTOS.ANFITRION(criterio.id));
      const delBackend = (Array.isArray(res.data) ? res.data : []).map(normalizarAlojamiento);

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

      // Conservar los creados solo en local (el backend aún no los devuelve).
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
    const userNombre = (criterio.nombre || '').trim().toLowerCase();
    return todos.filter(a => {
      if (criterio.id) return a.idAnfitrion === criterio.id;
      return userNombre !== '' && (a.nombreAnfitrion || '').trim().toLowerCase() === userNombre;
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
        capacidad: alojamiento.unidades?.[0]?.capacidadPersonas ?? 0,
        habitaciones: alojamiento.unidades?.[0]?.cantidadDormitorios ?? 0,
        estado: alojamiento.estadoPublicacion || alojamiento.estado || 'PENDIENTE',
        fechaRegistro: new Date().toISOString(),
        imagen: (alojamiento.fotografias || []).find(f => f.esPrincipal)?.url || alojamiento.fotografias?.[0]?.url || '',
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
