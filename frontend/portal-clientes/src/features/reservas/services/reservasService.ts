import { httpClient } from '../../../core/api/httpClient';
import { ENDPOINTS } from '../../../core/api/apiEndpoints';
import { CrearReservaPayload, ReservaResponse, RangoOcupado } from '../types/reserva.types';

const STORAGE_KEY_RESERVAS = 'alojate_reservas';

// Semilla Canónica de Reservas Activas para Demostración Realista de Disponibilidad
const RESERVAS_SEMILLA_CANONICAS: ReservaResponse[] = [
  {
    idReserva: 'res-tajibos-suite-1',
    idCliente: 'c0000000-0000-4000-8000-000000000001',
    nombreCliente: 'Fernando Torrico Vaca',
    idAnfitrion: 'a0000000-0000-4000-8000-000000000002',
    nombreAnfitrion: 'Carlos Mendoza',
    idAlojamiento: '49768530-76ae-459e-9bbe-faf2f3d488ba',
    tituloAlojamiento: 'Hotel Boutique Los Tajibos Colonial',
    idUnidad: 'u-tajibos-1',
    nombreUnidad: 'Suite Presidencial con Balcón & Vista a Jardines',
    checkIn: '2026-11-14',
    checkOut: '2026-11-18',
    horaEstimadaLlegada: '14:30',
    nochesEstadia: 4,
    cantidadHuespedes: 2,
    cantidadUnidades: 1,
    precioNoche: 850,
    importeTotal: 3400,
    moneda: 'BOB',
    estado: 'CONFIRMADA',
    codigoCheckin: '381920',
    sagaId: 'saga-tajibos-01',
    fechaCreacion: '2026-11-01T10:00:00Z',
  },
  {
    idReserva: 'res-tajibos-twin-1',
    idCliente: 'c0000000-0000-4000-8000-000000000002',
    nombreCliente: 'Verónica Méndez Suárez',
    idAnfitrion: 'a0000000-0000-4000-8000-000000000002',
    nombreAnfitrion: 'Carlos Mendoza',
    idAlojamiento: '49768530-76ae-459e-9bbe-faf2f3d488ba',
    tituloAlojamiento: 'Hotel Boutique Los Tajibos Colonial',
    idUnidad: 'u-tajibos-2',
    nombreUnidad: 'Habitación Ejecutiva Doble Twin',
    checkIn: '2026-11-20',
    checkOut: '2026-11-24',
    horaEstimadaLlegada: '15:00',
    nochesEstadia: 4,
    cantidadHuespedes: 2,
    cantidadUnidades: 1,
    precioNoche: 480,
    importeTotal: 1920,
    moneda: 'BOB',
    estado: 'CONFIRMADA',
    codigoCheckin: '592814',
    sagaId: 'saga-tajibos-02',
    fechaCreacion: '2026-11-02T11:30:00Z',
  },
  {
    idReserva: 'res-palmar-1',
    idCliente: 'c0000000-0000-4000-8000-000000000003',
    nombreCliente: 'Mariana Suárez Paz',
    idAnfitrion: 'a0000000-0000-4000-8000-000000000002',
    nombreAnfitrion: 'Carlos Mendoza',
    idAlojamiento: '93fce18e-32fa-400c-8f49-8d4f2fe2f5bb',
    tituloAlojamiento: 'Cabaña Chiquitana El Palmar',
    idUnidad: '00547b62-d2f5-4aa8-80a5-8662b2e028ec',
    nombreUnidad: 'Cabaña Completa con Galería y Piscina',
    checkIn: '2026-11-16',
    checkOut: '2026-11-19',
    horaEstimadaLlegada: '14:00',
    nochesEstadia: 3,
    cantidadHuespedes: 6,
    cantidadUnidades: 1,
    precioNoche: 650,
    importeTotal: 1950,
    moneda: 'BOB',
    estado: 'CONFIRMADA',
    codigoCheckin: '142857',
    sagaId: 'saga-palmar-01',
    fechaCreacion: '2026-10-30T14:15:00Z',
  },
  {
    idReserva: 'res-rinconada-1',
    idCliente: 'c0000000-0000-4000-8000-000000000004',
    nombreCliente: 'Rodrigo Arce Villarroel',
    idAnfitrion: 'a0000000-0000-4000-8000-000000000002',
    nombreAnfitrion: 'Carlos Mendoza',
    idAlojamiento: '045579cf-cc3b-4893-920f-f32246153025',
    tituloAlojamiento: 'Casa de Campo La Rinconada — Valles Cruceños',
    idUnidad: '351b4c06-6bdf-4dc6-9d3b-0d4221123600',
    nombreUnidad: 'Casa de Campo Completa con Fogata',
    checkIn: '2026-11-25',
    checkOut: '2026-11-28',
    horaEstimadaLlegada: '13:00',
    nochesEstadia: 3,
    cantidadHuespedes: 4,
    cantidadUnidades: 1,
    precioNoche: 520,
    importeTotal: 1560,
    moneda: 'BOB',
    estado: 'CONFIRMADA',
    codigoCheckin: '782341',
    sagaId: 'saga-rinconada-01',
    fechaCreacion: '2026-11-03T09:40:00Z',
  },
  {
    idReserva: 'res-vinedos-1',
    idCliente: 'c0000000-0000-4000-8000-000000000005',
    nombreCliente: 'Claudio Peñaranda Durán',
    idAnfitrion: 'a0000000-0000-4000-8000-000000000003',
    nombreAnfitrion: 'Elena Morales',
    idAlojamiento: 'ca4d2e81-7b90-41f2-9854-1b3a88c22110',
    tituloAlojamiento: 'Chalet Boutique Los Viñedos',
    idUnidad: 'd1a4e802-5c31-4a29-b612-426614174002',
    nombreUnidad: 'Villa Malbec del Valle',
    checkIn: '2026-11-12',
    checkOut: '2026-11-15',
    horaEstimadaLlegada: '14:00',
    nochesEstadia: 3,
    cantidadHuespedes: 4,
    cantidadUnidades: 1,
    precioNoche: 780,
    importeTotal: 2340,
    moneda: 'BOB',
    estado: 'CONFIRMADA',
    codigoCheckin: '492018',
    sagaId: 'saga-vinedos-01',
    fechaCreacion: '2026-10-29T16:20:00Z',
  }
];

// Helper para leer/escribir persistencia local
const obtenerReservasLocales = (): ReservaResponse[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RESERVAS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_RESERVAS, JSON.stringify(RESERVAS_SEMILLA_CANONICAS));
      return RESERVAS_SEMILLA_CANONICAS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEY_RESERVAS, JSON.stringify(RESERVAS_SEMILLA_CANONICAS));
    return RESERVAS_SEMILLA_CANONICAS;
  } catch {
    return RESERVAS_SEMILLA_CANONICAS;
  }
};

const guardarReservasLocales = (reservas: ReservaResponse[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_RESERVAS, JSON.stringify(reservas));
  } catch (e) {
    console.warn('Error al guardar reservas en localStorage:', e);
  }
};

export const reservasService = {
  /**
   * Obtiene todos los rangos de fechas ya ocupadas/bloqueadas para una unidad o habitación específica.
   * Auto-purga en caliente reservas en PENDIENTE_PAGO con más de 15 minutos para evitar bloqueos huérfanos.
   */
  async obtenerRangosOcupados(idUnidad: string): Promise<RangoOcupado[]> {
    const todas = obtenerReservasLocales();
    const now = Date.now();

    // Auto-purga reactiva de reservas locales pendientes de pago con más de 15 minutos
    const actualizadas = todas.map((r) => {
      if (r.estado === 'PENDIENTE_PAGO' && r.fechaCreacion) {
        const transcurridoSegundos = (now - new Date(r.fechaCreacion).getTime()) / 1000;
        if (transcurridoSegundos > 15 * 60) {
          return { ...r, estado: 'EXPIRADA' as const };
        }
      }
      return r;
    });
    guardarReservasLocales(actualizadas);

    return actualizadas
      .filter((r) => r.idUnidad === idUnidad && r.estado !== 'CANCELADA' && r.estado !== 'EXPIRADA')
      .map((r) => ({
        idReserva: r.idReserva,
        checkIn: r.checkIn,
        checkOut: r.checkOut,
        horaEntrada: r.horaEstimadaLlegada || '14:00',
        horaSalida: '11:00',
        nombreCliente: r.nombreCliente,
        estado: r.estado,
      }));
  },

  /**
   * Verifica reactivamente si el rango [checkIn, checkOut] colisiona con alguna reserva existente.
   */
  async verificarDisponibilidad(
    unidadId: string,
    checkIn: string,
    checkOut: string
  ): Promise<{ disponible: boolean; fechasBloqueadas: string[]; conflicto?: RangoOcupado }> {
    // 1. Intento con microservicio vía Gateway
    try {
      const response = await httpClient.get<{ disponible: boolean; fechasBloqueadas: string[] }>(
        ENDPOINTS.RESERVAS.DISPONIBILIDAD(unidadId, checkIn, checkOut)
      );
      if (response.data && typeof response.data.disponible === 'boolean') {
        return response.data;
      }
    } catch {
      // Continuar con verificación en capa de datos local
    }

    // 2. Validación de solapamiento de rangos de fechas:
    // Rango A [checkIn, checkOut] y Rango B [bIn, bOut] se solapan si A_in < B_out && A_out > B_in
    const ocupadas = await this.obtenerRangosOcupados(unidadId);
    const reqIn = new Date(checkIn).getTime();
    const reqOut = new Date(checkOut).getTime();

    for (const oc of ocupadas) {
      const bIn = new Date(oc.checkIn).getTime();
      const bOut = new Date(oc.checkOut).getTime();

      if (reqIn < bOut && reqOut > bIn) {
        return {
          disponible: false,
          fechasBloqueadas: [oc.checkIn, oc.checkOut],
          conflicto: oc,
        };
      }
    }

    return { disponible: true, fechasBloqueadas: [] };
  },

  /**
   * Crea una nueva reserva (vía MS-02 o persistencia local-first resiliente).
   */
  async crearReserva(payload: CrearReservaPayload): Promise<ReservaResponse> {
    // Verificar colisión previa
    const disp = await this.verificarDisponibilidad(payload.idUnidad, payload.checkIn, payload.checkOut);
    if (!disp.disponible) {
      throw new Error(
        `Las fechas seleccionadas (${payload.checkIn} al ${payload.checkOut}) ya se encuentran ocupadas. Por favor elija otro intervalo.`
      );
    }

    // Cálculo de noches e importe
    const d1 = new Date(payload.checkIn).getTime();
    const d2 = new Date(payload.checkOut).getTime();
    const noches = Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)));
    const importeTotal = noches * payload.precioNoche;

    // PIN aleatorio de 6 dígitos para check-in
    const pinGenerado = Math.floor(100000 + Math.random() * 900000).toString();
    const uuidReserva = 'res-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);

    const nuevaReserva: ReservaResponse = {
      idReserva: uuidReserva,
      idCliente: payload.idCliente,
      nombreCliente: payload.nombreCliente,
      idAnfitrion: payload.idAnfitrion,
      nombreAnfitrion: payload.nombreAnfitrion || 'Anfitrión Verificado',
      idAlojamiento: payload.idAlojamiento,
      tituloAlojamiento: payload.tituloAlojamiento,
      idUnidad: payload.idUnidad,
      nombreUnidad: payload.nombreUnidad,
      checkIn: payload.checkIn,
      checkOut: payload.checkOut,
      horaEstimadaLlegada: payload.horaEstimadaLlegada || '14:00',
      nochesEstadia: noches,
      cantidadHuespedes: payload.cantidadHuespedes,
      cantidadUnidades: payload.cantidadUnidades || 1,
      precioNoche: payload.precioNoche,
      importeTotal,
      moneda: 'BOB',
      estado: 'PENDIENTE_PAGO',
      codigoCheckin: pinGenerado,
      sagaId: 'saga-' + Math.random().toString(36).substring(2, 10),
      fechaCreacion: new Date().toISOString(),
    };

    // Intentar envío al Microservicio
    try {
      const response = await httpClient.post<ReservaResponse>(ENDPOINTS.RESERVAS.CREAR, payload);
      if (response.data && response.data.idReserva) {
        const reservas = obtenerReservasLocales();
        guardarReservasLocales([response.data, ...reservas.filter((r) => r.idReserva !== response.data.idReserva)]);
        return response.data;
      }
    } catch {
      // Modo local-first continuo
    }

    // Persistir localmente
    const reservas = obtenerReservasLocales();
    guardarReservasLocales([nuevaReserva, ...reservas]);

    // Sincronizar mis reservas cliente
    try {
      const misReservasRaw = localStorage.getItem('alojate_mis_reservas');
      const mis = misReservasRaw ? JSON.parse(misReservasRaw) : [];
      localStorage.setItem('alojate_mis_reservas', JSON.stringify([nuevaReserva, ...mis]));
    } catch {}

    return nuevaReserva;
  },

  async obtenerReserva(id: string): Promise<ReservaResponse> {
    try {
      const response = await httpClient.get<ReservaResponse>(ENDPOINTS.RESERVAS.OBTENER(id));
      if (response.data) return response.data;
    } catch {}

    const todas = obtenerReservasLocales();
    const encontrada = todas.find((r) => r.idReserva === id);
    if (encontrada) return encontrada;
    throw new Error('Reserva no encontrada');
  },

  async listarTodas(): Promise<ReservaResponse[]> {
    try {
      const response = await httpClient.get<ReservaResponse[]>(ENDPOINTS.RESERVAS.LISTAR_TODAS);
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch {}
    return obtenerReservasLocales();
  },

  async listarPorAnfitrion(anfitrionId: string): Promise<ReservaResponse[]> {
    try {
      const response = await httpClient.get<ReservaResponse[]>(ENDPOINTS.RESERVAS.ANFITRION_HISTORIAL(anfitrionId));
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch {}

    const todas = obtenerReservasLocales();
    // Filtro flexible por ID de anfitrión o fallback general
    const filtradas = todas.filter(
      (r) => r.idAnfitrion === anfitrionId || r.nombreAnfitrion?.toLowerCase().includes('carlos')
    );
    return filtradas.length > 0 ? filtradas : todas;
  },

  async listarPorCliente(clienteId: string): Promise<ReservaResponse[]> {
    try {
      const response = await httpClient.get<ReservaResponse[]>(ENDPOINTS.RESERVAS.CLIENTE_HISTORIAL(clienteId));
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch {}

    const todas = obtenerReservasLocales();
    const filtradas = todas.filter((r) => r.idCliente === clienteId);
    return filtradas;
  },

  async confirmarPagoSaga(idReserva: string, pagoId: string, transaccionBancariaRef: string): Promise<ReservaResponse> {
    try {
      const response = await httpClient.post<ReservaResponse>(ENDPOINTS.RESERVAS.CONFIRMAR_PAGO(idReserva), {
        pagoId,
        metodoPago: 'QR_SIMPLE_BNB',
        transaccionBancariaRef,
      });
      if (response.data) return response.data;
    } catch {}

    const todas = obtenerReservasLocales();
    let resActualizada: ReservaResponse | null = null;
    const mapeadas = todas.map((r) => {
      if (r.idReserva === idReserva) {
        resActualizada = { ...r, estado: 'CONFIRMADA' as const };
        return resActualizada;
      }
      return r;
    });

    guardarReservasLocales(mapeadas);

    // Actualizar mis reservas
    try {
      const misRaw = localStorage.getItem('alojate_mis_reservas');
      if (misRaw) {
        const mis = JSON.parse(misRaw);
        localStorage.setItem(
          'alojate_mis_reservas',
          JSON.stringify(mis.map((r: any) => (r.idReserva === idReserva ? { ...r, estado: 'CONFIRMADA' } : r)))
        );
      }
    } catch {}

    return resActualizada || todas[0];
  },

  async cancelarReserva(idReserva: string, motivo?: string): Promise<ReservaResponse> {
    try {
      const response = await httpClient.post<ReservaResponse>(ENDPOINTS.RESERVAS.CANCELAR(idReserva), {
        motivo: motivo || 'Cancelada por el huésped según política de cancelación flexible',
      });
      if (response.data) return response.data;
    } catch {}

    const todas = obtenerReservasLocales();
    let resActualizada: ReservaResponse | null = null;
    const mapeadas = todas.map((r) => {
      if (r.idReserva === idReserva) {
        resActualizada = { ...r, estado: 'CANCELADA' as const };
        return resActualizada;
      }
      return r;
    });

    guardarReservasLocales(mapeadas);
    return resActualizada || todas[0];
  },

  async realizarCheckIn(idReserva: string, codigoCheckin: string, notasHuesped?: string): Promise<ReservaResponse> {
    try {
      const response = await httpClient.post<ReservaResponse>(ENDPOINTS.RESERVAS.CHECK_IN(idReserva), {
        codigoCheckin,
        notasHuesped: notasHuesped || 'Check-in verificado presencialmente.',
      });
      if (response.data) return response.data;
    } catch {}

    const todas = obtenerReservasLocales();
    const encontrada = todas.find((r) => r.idReserva === idReserva);
    if (!encontrada) {
      throw new Error('Reserva no encontrada en recepción.');
    }

    if (encontrada.codigoCheckin && encontrada.codigoCheckin.trim() !== codigoCheckin.trim()) {
      throw new Error('Código PIN incorrecto. Verifique el PIN de 6 dígitos emitido en el comprobante del huésped.');
    }

    const resActualizada: ReservaResponse = {
      ...encontrada,
      estado: 'CHECK_IN',
    };

    guardarReservasLocales(todas.map((r) => (r.idReserva === idReserva ? resActualizada : r)));
    return resActualizada;
  },

  async finalizarCheckOut(idReserva: string): Promise<ReservaResponse> {
    try {
      const response = await httpClient.post<ReservaResponse>(ENDPOINTS.RESERVAS.CHECK_OUT(idReserva), {});
      if (response.data) return response.data;
    } catch {}

    const todas = obtenerReservasLocales();
    const encontrada = todas.find((r) => r.idReserva === idReserva);
    if (!encontrada) {
      throw new Error('Reserva no encontrada.');
    }

    const resActualizada: ReservaResponse = {
      ...encontrada,
      estado: 'COMPLETADA',
    };

    guardarReservasLocales(todas.map((r) => (r.idReserva === idReserva ? resActualizada : r)));
    return resActualizada;
  },
};
