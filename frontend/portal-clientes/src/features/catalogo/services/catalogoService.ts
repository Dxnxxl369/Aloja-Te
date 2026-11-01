import { httpClient } from '../../../core/api/httpClient';
import { ENDPOINTS } from '../../../core/api/apiEndpoints';
import { Alojamiento } from '../types/catalogo.types';

// Fuente Canónica Unificada de Alojamientos Demo (Compartida con Portal Admin y Base de Datos)
const ALOJAMIENTOS_DEMO: Alojamiento[] = [
  {
    idAlojamiento: '49768530-76ae-459e-9bbe-faf2f3d488ba',
    idAnfitrion: 'a0000000-0000-4000-8000-000000000002',
    nombreAnfitrion: 'Carlos Mendoza (Anfitrión Verificado)',
    titulo: 'Hotel Boutique Los Tajibos Colonial',
    descripcion: 'Exclusivo hotel boutique con arquitectura chiquitana colonial, restaurante de autor, piscina tropical, spa y jardines en el prestigioso barrio Equipetrol.',
    departamento: 'Santa Cruz',
    ciudad: 'Santa Cruz de la Sierra',
    direccion: 'Av. San Martín #120, Barrio Equipetrol',
    tipoPropiedad: 'HOTEL_BOUTIQUE',
    tipoEspacio: 'HABITACION_PRIVADA',
    modalidad: 'HOTEL_HOSTAL',
    politicas: 'Recepción 24 horas. Desayuno buffet incluido de 07:00 a 10:30.',
    horarioEntrada: '15:00',
    horarioSalida: '12:00',
    precioBaseNoche: 480,
    moneda: 'BOB',
    calificacionPromedio: 4.96,
    totalResenas: 74,
    estado: 'PUBLICADO',
    estadoPublicacion: 'PUBLICADO',
    fotografias: [
      {
        idFotografia: 'f-tajibos-1',
        url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        esPrincipal: true,
        orden: 1,
        descripcion: 'Piscina tropical y fachada colonial de Los Tajibos Colonial'
      },
      {
        idFotografia: 'f-tajibos-2',
        url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
        esPrincipal: false,
        orden: 2,
        descripcion: 'Suite presidencial con balcón y acabados de lujo'
      },
      {
        idFotografia: 'f-tajibos-3',
        url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
        esPrincipal: false,
        orden: 3,
        descripcion: 'Habitación doble ejecutiva colonial'
      }
    ],
    unidades: [
      {
        idUnidad: 'u-tajibos-1',
        nombre: 'Suite Presidencial con Balcón & Vista a Jardines',
        descripcion: 'Exclusiva master suite de 65 m² con cama King Size artesanal, terraza privada con vista a los jardines tropicales, tina de hidromasaje y servicio de desayuno buffet incluido.',
        capacidadPersonas: 2,
        cantidadCamas: 1,
        cantidadBanios: 2,
        precioNoche: 950,
        moneda: 'BOB',
        inventarioTotal: 3,
        activo: true,
        servicios: ['Cama King Size', 'Jacuzzi Hidromasaje', 'Balcón Panorámico', 'Desayuno Buffet Gourmet', 'Smart TV 65"', 'Aire Acondicionado Central'],
        fotos: [
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
        ],
        fotografias: [
          {
            idFotografia: 'f-suite-1',
            url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
            esPrincipal: true,
            orden: 1,
            descripcion: 'Dormitorio principal con cama King y ventanales'
          },
          {
            idFotografia: 'f-suite-2',
            url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
            esPrincipal: false,
            orden: 2,
            descripcion: 'Balcón terraza privado con vista a jardines'
          },
          {
            idFotografia: 'f-suite-3',
            url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
            esPrincipal: false,
            orden: 3,
            descripcion: 'Baño de mármol con tina de hidromasaje'
          }
        ]
      },
      {
        idUnidad: 'u-tajibos-2',
        nombre: 'Habitación Ejecutiva Doble Twin',
        descripcion: 'Habitación ejecutiva de 40 m² equipada con 2 camas individuales confortables, estación de trabajo ergonómica, internet satelital de alta velocidad y baño privado contemporáneo.',
        capacidadPersonas: 2,
        cantidadCamas: 2,
        cantidadBanios: 1,
        precioNoche: 480,
        moneda: 'BOB',
        inventarioTotal: 12,
        activo: true,
        servicios: ['2 Camas Twin Individuales', 'Escritorio Ergonómico', 'WiFi Starlink 300 Mbps', 'Cafetera Nespresso', 'Caja Fuerte Digital'],
        fotos: [
          'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80'
        ],
        fotografias: [
          {
            idFotografia: 'f-twin-1',
            url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
            esPrincipal: true,
            orden: 1,
            descripcion: 'Habitación doble twin con camas confortables y luz natural'
          },
          {
            idFotografia: 'f-twin-2',
            url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
            esPrincipal: false,
            orden: 2,
            descripcion: 'Área de escritorio y ambiente de trabajo'
          },
          {
            idFotografia: 'f-twin-3',
            url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80',
            esPrincipal: false,
            orden: 3,
            descripcion: 'Baño privado moderno con acabados en cerámica'
          }
        ]
      }
    ],
    servicios: [
      { idServicio: 1, nombre: 'Piscina Tropical & Bar', categoria: 'BIENESTAR' },
      { idServicio: 2, nombre: 'Desayuno Buffet Gourmet', categoria: 'GASTRONOMIA' },
      { idServicio: 3, nombre: 'Wi-Fi de Alta Velocidad', categoria: 'CONECTIVIDAD' },
      { idServicio: 4, nombre: 'Recepción & Valet 24 Horas', categoria: 'SEGURIDAD' }
    ]
  },
  {
    idAlojamiento: '93fce18e-32fa-400c-8f49-8d4f2fe2f5bb',
    idAnfitrion: 'a0000000-0000-4000-8000-000000000002',
    nombreAnfitrion: 'Carlos Mendoza (Anfitrión Verificado)',
    titulo: 'Cabaña Chiquitana El Palmar',
    descripcion: 'Hermosa cabaña rústica colonial con acabados en madera de tajibo, galería chiquitana con hamacas, piscina privada y churrasquera.',
    departamento: 'Santa Cruz',
    ciudad: 'San José de Chiquitos',
    direccion: 'Camino a San José Km 5',
    tipoPropiedad: 'CABAÑA',
    tipoEspacio: 'ALOJAMIENTO_ENTERO',
    modalidad: 'CASA_DEPARTAMENTO',
    politicas: 'Ambiente familiar. Check-in 14:00 - Check-out 11:00.',
    horarioEntrada: '14:00',
    horarioSalida: '11:00',
    precioBaseNoche: 650,
    moneda: 'BOB',
    calificacionPromedio: 4.95,
    totalResenas: 48,
    estado: 'PUBLICADO',
    estadoPublicacion: 'PUBLICADO',
    fotografias: [
      {
        idFotografia: 'f-palmar-1',
        url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
        esPrincipal: true,
        orden: 1,
        descripcion: 'Fachada campestre tradicional chiquitana'
      },
      {
        idFotografia: 'f-palmar-2',
        url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80',
        esPrincipal: false,
        orden: 2,
        descripcion: 'Piscina y galería de descanso'
      }
    ],
    unidades: [
      {
        idUnidad: '00547b62-d2f5-4aa8-80a5-8662b2e028ec',
        nombre: 'Cabaña Completa con Galería y Piscina',
        descripcion: 'Cabaña entera con 2 habitaciones, cocina equipada, parrillero y piscina.',
        capacidadPersonas: 6,
        cantidadCamas: 4,
        cantidadBanios: 2,
        precioNoche: 650,
        moneda: 'BOB',
        inventarioTotal: 1,
        activo: true
      }
    ],
    servicios: [
      { idServicio: 5, nombre: 'Piscina Privada', categoria: 'BIENESTAR' },
      { idServicio: 6, nombre: 'Churrasquera & Horno', categoria: 'GASTRONOMIA' },
      { idServicio: 7, nombre: 'Wi-Fi Satelital Starlink', categoria: 'CONECTIVIDAD' }
    ]
  },
  {
    idAlojamiento: '045579cf-cc3b-4893-920f-f32246153025',
    idAnfitrion: 'a0000000-0000-4000-8000-000000000002',
    nombreAnfitrion: 'Carlos Mendoza (Anfitrión Verificado)',
    titulo: 'Casa de Campo La Rinconada — Valles Cruceños',
    descripcion: 'Casa campestre en Samaipata con huerto orgánico, fogatero exterior y vista panorámica a los valles.',
    departamento: 'Santa Cruz',
    ciudad: 'Samaipata',
    direccion: 'Km 12 Camino a La Pajcha',
    tipoPropiedad: 'CASA_CAMPO',
    tipoEspacio: 'ALOJAMIENTO_ENTERO',
    modalidad: 'CASA_DEPARTAMENTO',
    politicas: 'Ecoturismo y descanso. Respeto al entorno natural.',
    horarioEntrada: '13:00',
    horarioSalida: '11:00',
    precioBaseNoche: 520,
    moneda: 'BOB',
    calificacionPromedio: 4.89,
    totalResenas: 19,
    estado: 'PENDIENTE',
    estadoPublicacion: 'PENDIENTE',
    fotografias: [
      {
        idFotografia: 'f-rinconada-1',
        url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
        esPrincipal: true,
        orden: 1,
        descripcion: 'Entorno campestre y vista panorámica a las colinas'
      }
    ],
    unidades: [
      {
        idUnidad: '351b4c06-6bdf-4dc6-9d3b-0d4221123600',
        nombre: 'Casa de Campo Completa con Fogata',
        descripcion: 'Alojamiento completo de 2 plantas con fogatero exterior.',
        capacidadPersonas: 6,
        cantidadCamas: 4,
        cantidadBanios: 2,
        precioNoche: 520,
        moneda: 'BOB',
        inventarioTotal: 1,
        activo: false
      }
    ],
    servicios: [
      { idServicio: 8, nombre: 'Fogatero Exterior', categoria: 'EXPERIENCIA' },
      { idServicio: 9, nombre: 'Estacionamiento Privado', categoria: 'COMODIDAD' }
    ]
  },
  {
    idAlojamiento: 'ca4d2e81-7b90-41f2-9854-1b3a88c22110',
    idAnfitrion: 'a0000000-0000-4000-8000-000000000003',
    nombreAnfitrion: 'Elena Calbimontes (Anfitriona Verificada)',
    titulo: 'Chalet Boutique Los Viñedos',
    descripcion: 'Encantadora villa boutique rodeada de viñedos en el Valle de la Concepción. Catas privadas de vino tarijeño de altura y fogatas bajo las estrellas.',
    departamento: 'Tarija',
    ciudad: 'Valle de la Concepción',
    direccion: 'Camino a Calamuchita Km 4',
    tipoPropiedad: 'CASA_CAMPO',
    tipoEspacio: 'ALOJAMIENTO_ENTERO',
    modalidad: 'CASA_DEPARTAMENTO',
    politicas: 'Prohibido fiestas ruidosas. Check-in 14:00 - Check-out 11:00.',
    horarioEntrada: '14:00',
    horarioSalida: '11:00',
    precioBaseNoche: 780,
    moneda: 'BOB',
    calificacionPromedio: 4.98,
    totalResenas: 62,
    estado: 'PUBLICADO',
    estadoPublicacion: 'PUBLICADO',
    fotografias: [
      {
        idFotografia: 'f-vinedos-1',
        url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80',
        esPrincipal: true,
        orden: 1,
        descripcion: 'Viñedo de altura y arquitectura rústica de piedra en Tarija'
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
      { idServicio: 10, nombre: 'Cata de Vinos de Altura', categoria: 'EXPERIENCIA' },
      { idServicio: 11, nombre: 'Desayuno Chapaco Típico', categoria: 'GASTRONOMIA' }
    ]
  },
  {
    idAlojamiento: 'ea199203-91aa-42a1-bf00-881273918a22',
    idAnfitrion: 'a0000000-0000-4000-8000-000000000003',
    nombreAnfitrion: 'Elena Calbimontes (Anfitriona Verificada)',
    titulo: 'Lodge Mirador del Illimani',
    descripcion: 'Espectacular refugio ecológico con ventanales de piso a techo hacia el majestuoso nevado Illimani. Calefacción ecológica y senderos de trekking.',
    departamento: 'La Paz',
    ciudad: 'Mecapaca',
    direccion: 'Colina del Cóndor s/n',
    tipoPropiedad: 'ECO_LODGE',
    tipoEspacio: 'HABITACION_PRIVADA',
    modalidad: 'CASA_DEPARTAMENTO',
    politicas: 'Refugio de montaña silencioso. Check-in 14:00.',
    horarioEntrada: '14:00',
    horarioSalida: '11:00',
    precioBaseNoche: 520,
    moneda: 'BOB',
    calificacionPromedio: 4.88,
    totalResenas: 35,
    estado: 'OBSERVADO',
    estadoPublicacion: 'OBSERVADO',
    motivoObservacionRechazo: 'Revisión preventiva por comentarios sobre baja temperatura nocturna',
    origenUltimoCambio: 'NLP_TOPICOS_RESENAS',
    fotografias: [
      {
        idFotografia: 'f-illimani-1',
        url: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=80',
        esPrincipal: true,
        orden: 1,
        descripcion: 'Refugio de montaña con vista al nevado Illimani'
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
      { idServicio: 12, nombre: 'Estufa a Leña', categoria: 'CALEFACCION' },
      { idServicio: 13, nombre: 'Telescopio de Observación', categoria: 'EXPERIENCIA' }
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

export const catalogoService = {
  async listarAlojamientos(departamento?: string): Promise<Alojamiento[]> {
    let baseList: Alojamiento[] = [];
    try {
      const response = await httpClient.get<any[]>(ENDPOINTS.ALOJAMIENTOS.LISTAR);
      if (response.data && response.data.length > 0) {
        baseList = response.data.map(normalizarAlojamiento);
      }
    } catch {
      baseList = ALOJAMIENTOS_DEMO;
    }

    if (baseList.length === 0) {
      baseList = ALOJAMIENTOS_DEMO;
    }

    // Unir alojamientos canónicos demo si el backend no los devolvió todos
    const demoMap = new Map<string, Alojamiento>();
    ALOJAMIENTOS_DEMO.forEach(demo => demoMap.set(demo.idAlojamiento, demo));
    baseList.forEach(item => demoMap.set(item.idAlojamiento, item));
    baseList = Array.from(demoMap.values());

    // Agregar alojamientos personalizados creados por el anfitrión (persistencia local)
    try {
      const customRaw = localStorage.getItem('alojate_alojamientos_custom');
      if (customRaw) {
        const customItems: Alojamiento[] = JSON.parse(customRaw);
        const map = new Map<string, Alojamiento>();
        baseList.forEach(item => map.set(item.idAlojamiento, item));
        customItems.forEach(item => map.set(item.idAlojamiento, item));
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
