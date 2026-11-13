import { Alojamiento } from '../../../core/types/anfitrion.types';
import { API_BASE_URL } from '../../../core/api/apiEndpoints';

// Sin alojamientos semilla iniciales (Base limpia para pruebas desde cero)
export const ALOJAMIENTOS_INICIALES: Record<string, Alojamiento[]> = {};

// Sincronizar estado de moderación con las decisiones tomadas por el Administrador en Portal Admin
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
          const nuevoEst = adminItem.estado || a.estado;
          const nuevoMotivo = adminItem.motivoObservacionRechazo || adminItem.motivoRechazo || a.motivoObservacionRechazo;
          return {
            ...a,
            estado: nuevoEst,
            estadoPublicacion: nuevoEst,
            motivoObservacionRechazo: nuevoMotivo,
            motivoRechazo: nuevoMotivo,
            origenUltimoCambio: adminItem.origenUltimoCambio || a.origenUltimoCambio
          };
        }
        return a;
      });
    }
  } catch (e) {
    console.warn('[AlojamientoService] Error al sincronizar con auditoría de admin:', e);
  }
  return lista;
}

export const alojamientoService = {
  obtenerPorAnfitrion(clave: string): Alojamiento[] {
    let listaBase: Alojamiento[] = [];
    try {
      const guardado = localStorage.getItem(`alojate_anfitrion_${clave}`);
      if (guardado) {
        listaBase = JSON.parse(guardado);
      }
    } catch {}
    // Sincronizar reactivamente con las resoluciones del Administrador
    return sincronizarConDecisionesAdmin(listaBase);
  },

  async sincronizarConServidor(clave: string): Promise<Alojamiento[]> {
    const map = new Map<string, Alojamiento>();
    let servidorRespondio = false;

    try {
      const urls = [
        `${API_BASE_URL}/api/v1/alojamientos/todos`,
        clave.includes('daniel') ? `${API_BASE_URL}/api/v1/alojamientos/anfitrion/7c772f61-90f1-474a-8acf-e7ba66e20d40` : null,
        `${API_BASE_URL}/api/v1/alojamientos/anfitrion/${clave}`
      ].filter(Boolean) as string[];

      for (const url of urls) {
        try {
          const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
          if (resp.ok) {
            const remotos: any[] = await resp.json();
            if (Array.isArray(remotos)) {
              servidorRespondio = true;
              remotos.forEach(r => {
                const id = r.idAlojamiento || r.id;
                const matchAnf = 
                  (r.idAnfitrion && (
                    r.idAnfitrion === clave ||
                    r.idAnfitrion.toLowerCase().includes(clave.toLowerCase()) ||
                    (clave.includes('daniel') && (
                      r.idAnfitrion === '7c772f61-90f1-474a-8acf-e7ba66e20d40' ||
                      r.idAnfitrion === '2bd6c1ff-bca9-4ef8-930e-02330a949616' ||
                      r.idAnfitrion === 'a2105381-7824-4dd4-9a28-f335a1b97bd9' ||
                      r.idAnfitrion === '5ca26631-e4d6-4f28-a085-72ad70c4b322'
                    ))
                  )) ||
                  (r.nombreAnfitrion && (
                    r.nombreAnfitrion.toLowerCase().includes(clave.toLowerCase()) ||
                    (clave.includes('daniel') && r.nombreAnfitrion.toLowerCase().includes('daniel'))
                  )) ||
                  (clave === 'carlos' && (r.idAnfitrion?.includes('carlos') || r.nombreAnfitrion?.toLowerCase().includes('carlos') || !r.idAnfitrion));
                
                if (id && matchAnf) {
                  const previo = map.get(id);
                  map.set(id, {
                    ...(previo || {}),
                    idAlojamiento: id,
                    idAnfitrion: r.idAnfitrion || previo?.idAnfitrion || (clave.includes('daniel') ? '7c772f61-90f1-474a-8acf-e7ba66e20d40' : 'a0000000-0000-4000-8000-000000000002'),
                    nombreAnfitrion: r.nombreAnfitrion || previo?.nombreAnfitrion || (clave.includes('daniel') ? 'Daniel Quispe' : 'Carlos Mendoza'),
                    titulo: r.titulo || previo?.titulo || 'Alojamiento Registrado',
                    descripcion: r.descripcion || previo?.descripcion || '',
                    departamento: r.departamento || previo?.departamento || (clave.includes('daniel') ? 'La Paz' : 'Santa Cruz'),
                    ciudad: r.ciudad || previo?.ciudad || (clave.includes('daniel') ? 'La Paz' : 'Santa Cruz de la Sierra'),
                    direccion: r.direccion || previo?.direccion || '',
                    tipoPropiedad: r.tipoPropiedad || previo?.tipoPropiedad || 'HOTEL',
                    modalidad: r.modalidad || previo?.modalidad || 'HOTEL_HOSTAL',
                    precioBaseNoche: Number(r.precioBaseNoche ?? r.precioNoche ?? previo?.precioBaseNoche ?? 450),
                    moneda: r.moneda || 'BOB',
                    calificacionPromedio: Number(r.calificacionPromedio ?? previo?.calificacionPromedio ?? 5.0),
                    totalResenas: Number(r.totalResenas ?? previo?.totalResenas ?? 0),
                    estado: r.estadoPublicacion || r.estado || previo?.estado || 'PENDIENTE',
                    estadoPublicacion: r.estadoPublicacion || r.estado || previo?.estadoPublicacion || 'PENDIENTE',
                    motivoObservacionRechazo: r.motivoObservacionRechazo || r.motivoRechazo || previo?.motivoObservacionRechazo,
                    motivoRechazo: r.motivoObservacionRechazo || r.motivoRechazo || previo?.motivoRechazo,
                    origenUltimoCambio: r.origenUltimoCambio || previo?.origenUltimoCambio,
                    fotografias: (r.fotografias && r.fotografias.length > 0) ? r.fotografias : (previo?.fotografias || []),
                    unidades: (r.unidades && r.unidades.length > 0) ? r.unidades : (previo?.unidades || []),
                    estadoOperativo: previo?.estadoOperativo || 'LIBRE',
                    reservas: previo?.reservas || []
                  });
                }
              });
            }
          }
        } catch {}
      }

      // Consultar y enlazar las reservas activas desde el backend (MS-02 vía Gateway)
      try {
        const respRes = await fetch(`${API_BASE_URL}/api/v1/reservas`, { headers: { 'Accept': 'application/json' } });
        if (respRes.ok) {
          const todasReservas: any[] = await respRes.json();
          if (Array.isArray(todasReservas) && todasReservas.length > 0) {
            map.forEach((aloj, alojId) => {
              const reservasDelAloj = todasReservas.filter((res: any) =>
                res.estado !== 'CANCELADA' &&
                res.estado !== 'COMPLETADA' &&
                (
                  res.idAlojamiento === alojId ||
                  res.alojamientoId === alojId ||
                  (res.tituloAlojamiento && aloj.titulo && res.tituloAlojamiento.trim().toLowerCase() === aloj.titulo.trim().toLowerCase())
                )
              );

              if (reservasDelAloj.length > 0) {
                const itemsMapeados: any[] = reservasDelAloj.map((res: any) => ({
                  idReserva: res.idReserva || res.id,
                  huespedNombre: res.nombreCliente || res.huespedNombre || res.cliente || 'Huésped',
                  huespedTelefono: res.telefono || '+591 77012345',
                  desde: res.checkIn || res.fechaInicio || new Date().toISOString().split('T')[0],
                  hasta: res.checkOut || res.fechaFin || new Date().toISOString().split('T')[0],
                  pinSecreto: res.codigoCheckin || res.pin || '',
                  montoTotal: Number(res.importeTotal ?? res.montoTotal ?? 0),
                  metodoPago: res.metodoPago || (res.historialEventos?.find((e: any) => e.payload?.metodoPago)?.payload?.metodoPago) || 'Código QR Oficial',
                  estado: (res.estado === 'CHECKIN_REALIZADO' || res.estado === 'EN_USO' || res.estado === 'CHECK_IN') ? 'EN_USO' : 'PENDIENTE'
                }));

                aloj.reservas = itemsMapeados;
                const tieneEnUso = itemsMapeados.some(r => r.estado === 'EN_USO');
                if (tieneEnUso) {
                  aloj.estadoOperativo = 'EN_USO';
                } else {
                  aloj.estadoOperativo = 'PENDIENTE';
                }
              } else {
                aloj.reservas = [];
                aloj.estadoOperativo = 'LIBRE';
              }
            });
          }
        }
      } catch (errRes) {
        console.warn('[AlojamientoService] Error al sincronizar reservas:', errRes);
      }

      if (servidorRespondio) {
        const listaFinal = Array.from(map.values());
        this.guardar(clave, listaFinal);
        return sincronizarConDecisionesAdmin(listaFinal);
      }
    } catch (e) {
      // Si el backend no responde, la sincronización local funciona de forma transparente
    }

    const listaFallback = this.obtenerPorAnfitrion(clave);
    return sincronizarConDecisionesAdmin(listaFallback);
  },

  guardar(clave: string, lista: Alojamiento[]): void {
    try {
      localStorage.setItem(`alojate_anfitrion_${clave}`, JSON.stringify(lista));
      
      // Sincronizar también con el catálogo global y draft de alojamientos custom
      const customCatalogo = localStorage.getItem('alojate_alojamientos_custom');
      const catalogoActual: Alojamiento[] = customCatalogo ? JSON.parse(customCatalogo) : [];
      const map = new Map<string, Alojamiento>();
      catalogoActual.forEach(c => map.set(c.idAlojamiento, c));
      lista.forEach(l => map.set(l.idAlojamiento, l));
      localStorage.setItem('alojate_alojamientos_custom', JSON.stringify(Array.from(map.values())));
    } catch {}
  },

  async actualizar(clave: string, actualizado: Alojamiento): Promise<Alojamiento> {
    const listaActual = this.obtenerPorAnfitrion(clave);
    const id = actualizado.idAlojamiento;
    const nuevaLista = listaActual.map(a => a.idAlojamiento === id ? actualizado : a);
    this.guardar(clave, nuevaLista);

    // Enviar la actualización completa al Gateway central (para que portal-admin y el backend tengan la foto nueva inmediatamente)
    try {
      await fetch(`${API_BASE_URL}/api/v1/alojamientos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actualizado)
      });
    } catch (err) {
      console.warn('[AlojamientoService] Error al enviar actualización al servidor:', err);
    }
    return actualizado;
  },

  async crear(clave: string, nuevo: Alojamiento): Promise<Alojamiento> {
    const listaActual = this.obtenerPorAnfitrion(clave);
    const id = nuevo.idAlojamiento || `aloj-${Date.now()}`;
    const preparado: Alojamiento = {
      ...nuevo,
      idAlojamiento: id,
      estado: 'PENDIENTE',
      estadoPublicacion: 'PENDIENTE',
      estadoOperativo: 'LIBRE',
      reservas: []
    };

    const actualizada = [preparado, ...listaActual.filter(a => a.idAlojamiento !== id)];
    this.guardar(clave, actualizada);

    // Intentar publicar en el Gateway API central y enviar a revisión
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/alojamientos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preparado)
      });
      if (res.ok) {
        const guardado = await res.json();
        const idFinal = guardado.idAlojamiento || guardado.id || id;
        preparado.idAlojamiento = idFinal;
        try {
          await fetch(`${API_BASE_URL}/api/v1/alojamientos/${idFinal}/enviar-revision`, { method: 'POST' });
        } catch {}
      }
    } catch {}

    return preparado;
  }
};
