import { httpClient } from '../../../core/api/httpClient';
import { ENDPOINTS } from '../../../core/api/apiEndpoints';
import { Alojamiento } from '../types/catalogo.types';

// Fallback seed data if backend is starting up
const ALOJAMIENTOS_DEMO: Alojamiento[] = [
  {
    idAlojamiento: 'bf6c3afa-a6ab-4053-a9c2-d131a4f7539e',
    idAnfitrion: '5211de5d-bd9e-4cb7-8912-3fbf6a0184b0',
    nombreAnfitrion: 'Carlos Mendoza (Anfitrión Superhost)',
    titulo: 'Cabaña Chiquitana El Palmar',
    descripcion: 'Hermosa cabaña rústica con acabados en madera de tajibo y galería tradicional chiquitana. Ubicada a pasos de la plaza misional, con piscina, hamacas y vistas a la serranía.',
    departamento: 'Santa Cruz',
    ciudad: 'San Javier',
    direccion: 'Av. Las Misiones #45, Zona El Palmar',
    tipoPropiedad: 'CABAÑA',
    tipoEspacio: 'ALOJAMIENTO_ENTERO',
    precioBaseNoche: 650,
    moneda: 'BOB',
    calificacionPromedio: 4.95,
    totalResenas: 48,
    estado: 'PUBLICADO',
    fotografias: [
      {
        idFotografia: 'f1',
        url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
        esPrincipal: true,
        orden: 1,
        descripcion: 'Fachada colonial con tejas de arcilla y galería'
      },
      {
        idFotografia: 'f2',
        url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
        esPrincipal: false,
        orden: 2,
        descripcion: 'Dormitorio principal con vigas de madera a la vista'
      },
      {
        idFotografia: 'f3',
        url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80',
        esPrincipal: false,
        orden: 3,
        descripcion: 'Piscina y área de descanso'
      }
    ],
    unidades: [
      {
        idUnidad: '00547b62-d2f5-4aa8-80a5-8662b2e028ec',
        nombre: 'Master Suite Chiquitana',
        descripcion: 'Cama King, aire acondicionado, baño privado con ducha de hidromasaje y balcón privado.',
        capacidadPersonas: 4,
        cantidadCamas: 2,
        cantidadBanios: 1,
        precioNoche: 650,
        moneda: 'BOB',
        inventarioTotal: 3,
        activo: true
      }
    ],
    servicios: [
      { idServicio: 1, nombre: 'Wi-Fi Starlink', categoria: 'CONECTIVIDAD' },
      { idServicio: 2, nombre: 'Piscina Templada', categoria: 'BIENESTAR' },
      { idServicio: 3, nombre: 'Churrasquera & Horno de Barro', categoria: 'GASTRONOMIA' },
      { idServicio: 4, nombre: 'Aire Acondicionado', categoria: 'CLIMATIZACION' },
    ]
  },
  {
    idAlojamiento: 'ca4d2e81-7b90-41f2-9854-1b3a88c22110',
    idAnfitrion: '5211de5d-bd9e-4cb7-8912-3fbf6a0184b0',
    nombreAnfitrion: 'Doña Elena Calbimontes',
    titulo: 'Chalet Boutique Los Viñedos',
    descripcion: 'Encantadora villa boutique rodeada de viñedos en el Valle de la Concepción. Catas privadas de vino tarijeño de altura y fogatas bajo las estrellas.',
    departamento: 'Tarija',
    ciudad: 'Valle de la Concepción',
    direccion: 'Camino a Calamuchita Km 4',
    tipoPropiedad: 'CASA_CAMPO',
    tipoEspacio: 'ALOJAMIENTO_ENTERO',
    precioBaseNoche: 780,
    moneda: 'BOB',
    calificacionPromedio: 4.98,
    totalResenas: 62,
    estado: 'PUBLICADO',
    fotografias: [
      {
        idFotografia: 'f4',
        url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        esPrincipal: true,
        orden: 1,
        descripcion: 'Vista panorámica al viñedo y terraza privada'
      }
    ],
    unidades: [
      {
        idUnidad: 'd1a4e802-5c31-4a29-b612-426614174002',
        nombre: 'Villa Malbec del Valle',
        descripcion: 'Chalet completo con chimenea rústica y cava de vinos.',
        capacidadPersonas: 5,
        cantidadCamas: 3,
        cantidadBanios: 2,
        precioNoche: 780,
        moneda: 'BOB',
        inventarioTotal: 2,
        activo: true
      }
    ],
    servicios: [
      { idServicio: 5, nombre: 'Cata de Vinos de Altura', categoria: 'EXPERIENCIA' },
      { idServicio: 1, nombre: 'Wi-Fi Fibra Óptica', categoria: 'CONECTIVIDAD' },
      { idServicio: 6, nombre: 'Desayuno Chapaco Incluido', categoria: 'GASTRONOMIA' }
    ]
  },
  {
    idAlojamiento: 'ea199203-91aa-42a1-bf00-881273918a22',
    idAnfitrion: '5211de5d-bd9e-4cb7-8912-3fbf6a0184b0',
    nombreAnfitrion: 'Albergue Andino Illimani',
    titulo: 'Lodge Mirador del Illimani',
    descripcion: 'Espectacular refugio ecológico con ventanales de piso a techo hacia el majestuoso nevado Illimani. Calefacción ecológica y senderos de trekking.',
    departamento: 'La Paz',
    ciudad: 'Mecapaca',
    direccion: 'Colina del Cóndor s/n',
    tipoPropiedad: 'ECO_LODGE',
    tipoEspacio: 'HABITACION_PRIVADA',
    precioBaseNoche: 520,
    moneda: 'BOB',
    calificacionPromedio: 4.88,
    totalResenas: 35,
    estado: 'PUBLICADO',
    fotografias: [
      {
        idFotografia: 'f5',
        url: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80',
        esPrincipal: true,
        orden: 1,
        descripcion: 'Mirador panorámico al atardecer sobre el Illimani'
      }
    ],
    unidades: [
      {
        idUnidad: 'd1a4e803-5c31-4a29-b612-426614174003',
        nombre: 'Suite Cóndor Real',
        descripcion: 'Cama Queen térmica, estufa a leña y telescopio astronómico.',
        capacidadPersonas: 2,
        cantidadCamas: 1,
        cantidadBanios: 1,
        precioNoche: 520,
        moneda: 'BOB',
        inventarioTotal: 4,
        activo: true
      }
    ],
    servicios: [
      { idServicio: 7, nombre: 'Estufa a Leña', categoria: 'CALEFACCION' },
      { idServicio: 8, nombre: 'Telescopio de Observación', categoria: 'EXPERIENCIA' },
      { idServicio: 1, nombre: 'Wi-Fi Satelital', categoria: 'CONECTIVIDAD' }
    ]
  }
];

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
          activo: u.estado === 'DISPONIBLE' || u.activo !== false
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

export const catalogoService = {
  async listarAlojamientos(departamento?: string): Promise<Alojamiento[]> {
    let baseList: Alojamiento[] = [];
    try {
      const response = await httpClient.get<any[]>(ENDPOINTS.ALOJAMIENTOS.LISTAR);
      if (response.data && response.data.length > 0) {
        baseList = response.data.map(normalizarAlojamiento);
      }
    } catch {
      // Fallback a demo con datos sembrados
      baseList = ALOJAMIENTOS_DEMO;
    }

    if (baseList.length === 0) {
      baseList = ALOJAMIENTOS_DEMO;
    }

    // Agregar alojamientos personalizados creados por el anfitrión (persistencia local)
    try {
      const customRaw = localStorage.getItem('alojate_alojamientos_custom');
      if (customRaw) {
        const customItems: Alojamiento[] = JSON.parse(customRaw);
        // Filtrar duplicados por idAlojamiento
        const map = new Map<string, Alojamiento>();
        baseList.forEach(item => map.set(item.idAlojamiento, item));
        customItems.forEach(item => map.set(item.idAlojamiento, item));
        baseList = Array.from(map.values());
      }
    } catch (e) {
      console.warn('Error al leer alojamientos locales:', e);
    }

    if (!departamento || departamento === 'Todos') return baseList;
    return baseList.filter(a => a.departamento.toLowerCase() === departamento.toLowerCase());
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
    } catch (e) {
      console.warn('No se pudo guardar en localStorage:', e);
    }
  },

  async listarValoraciones(idAlojamiento: string): Promise<any[]> {
    try {
      const res = await httpClient.get<any[]>(ENDPOINTS.ALOJAMIENTOS.VALORACIONES(idAlojamiento));
      return res.data || [];
    } catch (e) {
      return [];
    }
  },

  async listarValoracionesGeneralesHotel(idAlojamiento: string): Promise<any[]> {
    try {
      const res = await httpClient.get<any[]>(ENDPOINTS.ALOJAMIENTOS.VALORACIONES_HOTEL(idAlojamiento));
      return res.data || [];
    } catch (e) {
      return [];
    }
  },

  async listarValoracionesUnidad(idUnidad: string): Promise<any[]> {
    try {
      const res = await httpClient.get<any[]>(ENDPOINTS.ALOJAMIENTOS.VALORACIONES_UNIDAD(idUnidad));
      return res.data || [];
    } catch (e) {
      return [];
    }
  },

  async crearValoracion(idAlojamiento: string, req: any): Promise<any> {
    const res = await httpClient.post<any>(ENDPOINTS.ALOJAMIENTOS.VALORACIONES(idAlojamiento), req);
    return res.data;
  },

  async obtenerResumenValoraciones(idAlojamiento: string): Promise<any> {
    try {
      const res = await httpClient.get<any>(ENDPOINTS.ALOJAMIENTOS.RESUMEN_VALORACIONES(idAlojamiento));
      return res.data;
    } catch (e) {
      return null;
    }
  }
};
