package com.alojate.usuarios.application.service;

import com.alojate.usuarios.domain.exception.ModeracionNoDisponibleException;
import com.alojate.usuarios.domain.exception.TransicionEstadoInvalidaException;
import com.alojate.usuarios.domain.model.ActorPublicacion;
import com.alojate.usuarios.domain.model.Alojamiento;
import com.alojate.usuarios.domain.model.EstadoPublicacion;
import com.alojate.usuarios.domain.model.EventoPublicacion;
import com.alojate.usuarios.domain.model.Fotografia;
import com.alojate.usuarios.domain.model.MaquinaEstadosPublicacion;
import com.alojate.usuarios.domain.model.UnidadReservable;
import com.alojate.usuarios.domain.ports.in.AlojamientoUseCase;
import com.alojate.usuarios.domain.ports.out.AlojamientoRepositoryPort;
import com.alojate.usuarios.domain.ports.out.FotografiaRepositoryPort;
import com.alojate.usuarios.domain.ports.out.ModeracionNotificadorPort;
import com.alojate.usuarios.domain.ports.out.UnidadReservableRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlojamientoServiceImpl implements AlojamientoUseCase {

    private final AlojamientoRepositoryPort alojamientoRepository;
    private final FotografiaRepositoryPort fotografiaRepository;
    private final UnidadReservableRepositoryPort unidadReservableRepository;
    private final FotosHabitacionService fotosHabitacion;
    private final ModeracionNotificadorPort moderacionNotificador;
    private final TransactionTemplate transactionTemplate;
    private final PoliticaRevision politica;

    @Override
    @Transactional
    public Alojamiento crearAlojamiento(Alojamiento alojamiento, Set<Integer> serviciosIds) {
        if (alojamiento.getEstadoPublicacion() == null) {
            alojamiento.setEstadoPublicacion(EstadoPublicacion.PENDIENTE);
        }
        alojamiento.setFechaCreacion(LocalDateTime.now());
        alojamiento.setFechaUltimoCambioEstado(alojamiento.getFechaCreacion());
        alojamiento.setIntentosRevision(0);
        Alojamiento guardado = alojamientoRepository.guardar(alojamiento);

        if (serviciosIds != null && !serviciosIds.isEmpty()) {
            alojamientoRepository.sincronizarServicios(guardado.getIdAlojamiento(), serviciosIds);
            guardado = alojamientoRepository.buscarPorId(guardado.getIdAlojamiento()).orElse(guardado);
        }

        return guardado;
    }

    @Override
    @Transactional
    public Alojamiento actualizarAlojamiento(UUID idAlojamiento, Alojamiento datos, Set<Integer> serviciosIds) {
        Alojamiento existente = obtenerPorId(idAlojamiento);

        if (datos.getTitulo() != null) existente.setTitulo(datos.getTitulo());
        if (datos.getDescripcion() != null) existente.setDescripcion(datos.getDescripcion());
        if (datos.getDireccion() != null) existente.setDireccion(datos.getDireccion());
        if (datos.getCiudad() != null) existente.setCiudad(datos.getCiudad());
        if (datos.getDepartamento() != null) existente.setDepartamento(datos.getDepartamento());
        if (datos.getLatitud() != null) existente.setLatitud(datos.getLatitud());
        if (datos.getLongitud() != null) existente.setLongitud(datos.getLongitud());
        if (datos.getIdTipoPropiedad() != null) existente.setIdTipoPropiedad(datos.getIdTipoPropiedad());

        Alojamiento actualizado = alojamientoRepository.guardar(existente);

        if (serviciosIds != null) {
            alojamientoRepository.sincronizarServicios(idAlojamiento, serviciosIds);
            actualizado = alojamientoRepository.buscarPorId(idAlojamiento).orElse(actualizado);
        }

        return actualizado;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Alojamiento> listarPorEstado(EstadoPublicacion estado) {
        return alojamientoRepository.listarPorEstado(estado);
    }

    private void propagarCascadaUnidades(UUID idAlojamiento, boolean habilitar) {
        List<UnidadReservable> unidades = unidadReservableRepository.listarPorAlojamiento(idAlojamiento);
        for (UnidadReservable u : unidades) {
            u.setEstado(habilitar ? com.alojate.usuarios.domain.model.EstadoUnidad.DISPONIBLE : com.alojate.usuarios.domain.model.EstadoUnidad.MANTENIMIENTO);
            unidadReservableRepository.guardar(u);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Alojamiento obtenerPorId(UUID idAlojamiento) {
        return alojamientoRepository.buscarPorId(idAlojamiento)
                .orElseThrow(() -> new RuntimeException("Alojamiento no encontrado con id: " + idAlojamiento));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Alojamiento> listarTodos() {
        return alojamientoRepository.listarTodos();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Alojamiento> listarPorAnfitrion(UUID idAnfitrion) {
        return alojamientoRepository.listarPorAnfitrion(idAnfitrion);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Alojamiento> buscarPublicados(String ciudad, String departamento, Integer idTipoPropiedad, BigDecimal precioMax, Integer minHuespedes) {
        return alojamientoRepository.buscarAvanzada(ciudad, departamento, idTipoPropiedad, precioMax, minHuespedes);
    }

    @Override
    @Transactional
    public Fotografia agregarFotografia(UUID idAlojamiento, String url, Integer orden) {
        obtenerPorId(idAlojamiento); // valida existencia
        String urlTrim = url != null ? url.trim() : "";
        List<Fotografia> existentes = fotografiaRepository.listarPorAlojamiento(idAlojamiento);
        for (Fotografia f : existentes) {
            if (f.getUrl() != null && f.getUrl().trim().equalsIgnoreCase(urlTrim)) {
                return f; // Ya existe en la base de datos, evitar duplicación
            }
        }
        Fotografia foto = Fotografia.builder()
                .idAlojamiento(idAlojamiento)
                .url(urlTrim)
                .orden(orden != null ? orden : (existentes.size() + 1))
                .build();
        return fotografiaRepository.guardar(foto);
    }

    @Override
    @Transactional
    public void eliminarFotografia(UUID idFotografia) {
        fotografiaRepository.eliminarPorId(idFotografia);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Fotografia> listarFotografias(UUID idAlojamiento) {
        // Devuelve TODAS las fotos del alojamiento (galería + habitaciones): es lo que revisa el flujo de moderación.
        // Orden: primero la galería, luego cada habitación (por nombre), y dentro de cada grupo por "orden".
        Map<UUID, String> nombresUnidad = unidadReservableRepository.listarPorAlojamiento(idAlojamiento).stream()
                .collect(Collectors.toMap(UnidadReservable::getIdUnidad,
                        u -> u.getNombre() != null ? u.getNombre() : "Habitación",
                        (a, b) -> a));

        List<Fotografia> todas = new ArrayList<>(fotografiaRepository.listarPorAlojamiento(idAlojamiento));
        todas.forEach(f -> {
            if (f.getIdUnidad() != null) {
                f.setNombreUnidad(nombresUnidad.getOrDefault(f.getIdUnidad(), "Habitación"));
            }
        });
        todas.sort(Comparator
                .comparing((Fotografia f) -> f.getIdUnidad() != null)
                .thenComparing(f -> f.getNombreUnidad() != null ? f.getNombreUnidad() : "")
                .thenComparing(f -> f.getIdUnidad() != null ? f.getIdUnidad().toString() : "")
                .thenComparing(f -> f.getOrden() != null ? f.getOrden() : 0));
        return todas;
    }

    // --- CICLO DE PUBLICACIÓN (toda transición pasa por MaquinaEstadosPublicacion) ---
    @Override
    @Transactional(readOnly = true)
    public List<Alojamiento> listarPendientesModeracion() {
        return alojamientoRepository.listarPorEstado(EstadoPublicacion.EN_REVISION);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Alojamiento> listarRequierenAtencion() {
        return alojamientoRepository.listarPorEstado(EstadoPublicacion.PENDIENTE).stream()
                .filter(politica::requiereAtencion)
                .collect(Collectors.toList());
    }

    /**
     * Decisión informada por la IA (n8n) o por NLP. El evento se deduce del estado actual y del destino;
     * si no hay una transición válida para ese actor, responde 409. Si trae un {@code idRevision} que ya no
     * es el vigente, el resultado es de una revisión anterior y se descarta.
     */
    @Override
    @Transactional
    public Alojamiento cambiarEstado(UUID idAlojamiento, EstadoPublicacion destino, String motivo, String origen,
                                     ActorPublicacion actor, UUID idRevision) {
        Alojamiento alojamiento = obtenerPorId(idAlojamiento);
        UUID vigente = alojamiento.getIdRevision();
        if (idRevision != null && vigente != null && !idRevision.equals(vigente)) {
            throw new TransicionEstadoInvalidaException(
                    "Resultado descartado: pertenece a una revisión anterior (" + idRevision + "), la vigente es " + vigente + ".");
        }
        EventoPublicacion evento = MaquinaEstadosPublicacion.resolverEvento(estadoDe(alojamiento), destino, actor);
        return aplicarTransicion(alojamiento, evento, actor, motivo, origen, null);
    }

    @Override
    @Transactional
    public Alojamiento suspenderAlojamiento(UUID idAlojamiento, String motivo) {
        return aplicarTransicion(obtenerPorId(idAlojamiento), EventoPublicacion.SUSPENDER, ActorPublicacion.ADMIN,
                motivo != null && !motivo.isBlank() ? motivo : "Publicación suspendida por auditoría.", "ADMIN_MANUAL", null);
    }

    @Override
    @Transactional
    public Alojamiento reactivarAlojamiento(UUID idAlojamiento) {
        return aplicarTransicion(obtenerPorId(idAlojamiento), EventoPublicacion.REACTIVAR, ActorPublicacion.ADMIN,
                null, "ADMIN_MANUAL", null);
    }

    /**
     * Inicia la revisión automática. Desde PENDIENTE es el disparo del sistema (registro completo o reintento);
     * desde OBSERVADO es el reenvío del anfitrión tras corregir. Si no hay cupo, queda PENDIENTE y el job lo toma luego.
     */
    @Override
    public Alojamiento enviarARevision(UUID idAlojamiento) {
        boolean reenvio = estadoDe(obtenerPorId(idAlojamiento)) == EstadoPublicacion.OBSERVADO;
        return iniciarRevision(idAlojamiento,
                reenvio ? EventoPublicacion.REENVIAR_ANFITRION : EventoPublicacion.DISPARAR_REVISION,
                reenvio ? ActorPublicacion.ANFITRION : ActorPublicacion.SISTEMA,
                reenvio ? "ANFITRION_REENVIO" : "SISTEMA_AUTOMATICO",
                false);
    }

    @Override
    public Alojamiento reintentarRevision(UUID idAlojamiento) {
        Alojamiento actual = obtenerPorId(idAlojamiento);
        if (!politica.requiereAtencion(actual)) {
            throw new TransicionEstadoInvalidaException(
                    "Solo se puede reintentar manualmente una revisión que requiere atención (PENDIENTE con los intentos agotados).");
        }
        transactionTemplate.executeWithoutResult(status -> {
            Alojamiento a = obtenerPorId(idAlojamiento);
            a.setIntentosRevision(0);
            alojamientoRepository.guardar(a);
        });
        return iniciarRevision(idAlojamiento, EventoPublicacion.REINTENTAR_ADMIN, ActorPublicacion.ADMIN,
                "ADMIN_REINTENTO", true);
    }

    @Override
    @Transactional
    public Alojamiento vencerRevision(UUID idAlojamiento) {
        Alojamiento alojamiento = obtenerPorId(idAlojamiento);
        if (estadoDe(alojamiento) != EstadoPublicacion.EN_REVISION) {
            return alojamiento; // ya terminó mientras tanto: nada que vencer
        }
        return aplicarTransicion(alojamiento, EventoPublicacion.ERROR_TECNICO, ActorPublicacion.SISTEMA,
                "Tiempo de revisión agotado: el flujo de moderación no respondió.", "SISTEMA_VIGILANTE", null);
    }

    /**
     * Pasa a EN_REVISION (transacción confirmada) y recién después avisa al workflow de n8n, para que n8n nunca
     * actúe sobre un estado aún no guardado. Si el aviso falla se registra un error técnico: vuelve a PENDIENTE,
     * suma un intento y el job lo reintenta (el admin ve el error si fue él quien lo pidió).
     */
    private Alojamiento iniciarRevision(UUID idAlojamiento, EventoPublicacion evento, ActorPublicacion actor,
                                        String origen, boolean propagarFalloDeAviso) {
        Alojamiento actual = obtenerPorId(idAlojamiento);
        EstadoPublicacion estado = estadoDe(actual);
        MaquinaEstadosPublicacion.aplicar(estado, evento, actor); // 409 inmediato si el estado no corresponde

        if (estado == EstadoPublicacion.PENDIENTE) {
            if (politica.requiereAtencion(actual)) {
                throw new TransicionEstadoInvalidaException(
                        "La revisión agotó sus intentos automáticos: debe reintentarla un administrador.");
            }
            if (!politica.registroCompleto(actual)) {
                throw new TransicionEstadoInvalidaException(
                        "El registro está incompleto: se necesita al menos una foto de la galería y, en hoteles, una foto por habitación.");
            }
            if (alojamientoRepository.contarPorEstado(EstadoPublicacion.EN_REVISION) >= politica.getCupoConcurrente()) {
                return actual; // sin cupo: sigue PENDIENTE y el job lo enviará cuando haya lugar
            }
        } else if (esDeVisionIa(actual) && actual.getHuellaFotos() != null
                && actual.getHuellaFotos().equals(HuellaFotos.calcular(listarFotografias(idAlojamiento)))) {
            throw new TransicionEstadoInvalidaException(
                    "No se detectaron cambios en las fotografías desde la última revisión: corrige las fotos observadas antes de reenviar.");
        }

        UUID idRevision = UUID.randomUUID();
        Alojamiento enRevision = transactionTemplate.execute(
                status -> aplicarTransicion(obtenerPorId(idAlojamiento), evento, actor, null, origen, idRevision));

        try {
            moderacionNotificador.solicitarModeracion(idAlojamiento, idRevision);
            return enRevision;
        } catch (ModeracionNoDisponibleException ex) {
            Alojamiento fallido = transactionTemplate.execute(status -> aplicarTransicion(
                    obtenerPorId(idAlojamiento), EventoPublicacion.ERROR_TECNICO, ActorPublicacion.SISTEMA,
                    ex.getMessage(), "SISTEMA_ENVIO", null));
            if (propagarFalloDeAviso) {
                throw ex;
            }
            return fallido;
        }
    }

    /**
     * Único punto que modifica el estado: valida con la máquina, actualiza los datos de la revisión,
     * propaga el cambio a las habitaciones y guarda. Debe ejecutarse dentro de una transacción.
     */
    private Alojamiento aplicarTransicion(Alojamiento alojamiento, EventoPublicacion evento, ActorPublicacion actor,
                                          String motivo, String origen, UUID idRevisionNueva) {
        EstadoPublicacion anterior = estadoDe(alojamiento);
        EstadoPublicacion nuevo = MaquinaEstadosPublicacion.aplicar(anterior, evento, actor);

        alojamiento.setEstadoPublicacion(nuevo);
        alojamiento.setFechaUltimoCambioEstado(LocalDateTime.now());
        if (motivo != null) {
            alojamiento.setMotivoRechazo(motivo.trim());
            alojamiento.setMotivoObservacionRechazo(motivo.trim());
        }
        if (origen != null) {
            alojamiento.setOrigenUltimoCambio(origen.trim());
        }

        if (evento.iniciaRevision()) {
            alojamiento.setIdRevision(idRevisionNueva != null ? idRevisionNueva : UUID.randomUUID());
            alojamiento.setHuellaFotos(HuellaFotos.calcular(listarFotografias(alojamiento.getIdAlojamiento())));
        } else if (evento == EventoPublicacion.ERROR_TECNICO) {
            alojamiento.setIntentosRevision(alojamiento.intentosRevisionActuales() + 1);
            if (politica.requiereAtencion(alojamiento)) {
                log.warn("El alojamiento {} agotó sus {} intentos de revisión automática y requiere atención del administrador. Último error: {}",
                        alojamiento.getIdAlojamiento(), politica.getMaxIntentos(), motivo);            }
        } else if (evento == EventoPublicacion.IA_PUBLICA || evento == EventoPublicacion.IA_OBSERVA
                || evento == EventoPublicacion.IA_RECHAZA) {
            alojamiento.setIntentosRevision(0); // la revisión concluyó: se limpia el contador de fallos
        }

        propagarCascadaUnidades(alojamiento.getIdAlojamiento(), unidadesEnServicio(nuevo, anterior, origen));
        return alojamientoRepository.guardar(alojamiento);
    }

    /**
     * Regla de negocio: solo PUBLICADO deja las habitaciones en servicio. Un OBSERVADO que viene de PUBLICADO
     * (alerta de reseñas) sigue en servicio temporalmente; uno de la moderación inicial de fotos, no.
     */
    private boolean unidadesEnServicio(EstadoPublicacion nuevo, EstadoPublicacion anterior, String origen) {
        if (nuevo == EstadoPublicacion.PUBLICADO) {
            return true;
        }
        return nuevo == EstadoPublicacion.OBSERVADO
                && (anterior == EstadoPublicacion.PUBLICADO || (origen != null && origen.toUpperCase().contains("NLP")));
    }

    private EstadoPublicacion estadoDe(Alojamiento alojamiento) {
        return alojamiento.getEstadoPublicacion() != null ? alojamiento.getEstadoPublicacion() : EstadoPublicacion.PENDIENTE;
    }

    private boolean esDeVisionIa(Alojamiento alojamiento) {
        return alojamiento.getOrigenUltimoCambio() != null
                && alojamiento.getOrigenUltimoCambio().toUpperCase().contains("VISION");
    }

    // --- MODALIDAD CASA VS HOTEL ---
    @Override
    @Transactional
    public Alojamiento configurarOfertaUnica(UUID idAlojamiento, BigDecimal precioNoche, Integer capacidad, Integer dormitorios, Integer camas, BigDecimal banos) {
        Alojamiento alojamiento = obtenerPorId(idAlojamiento);
        alojamiento.setModalidad("CASA_DEPARTAMENTO");

        List<UnidadReservable> unidades = unidadReservableRepository.listarPorAlojamiento(idAlojamiento);
        UnidadReservable unidad;
        if (unidades.isEmpty()) {
            unidad = UnidadReservable.builder()
                    .idAlojamiento(idAlojamiento)
                    .nombre(alojamiento.getTitulo() != null ? alojamiento.getTitulo() : "Propiedad Completa")
                    .capacidadHuespedes(capacidad != null ? capacidad : 4)
                    .cantidadDormitorios(dormitorios != null ? dormitorios : 2)
                    .cantidadCamas(camas != null ? camas : 2)
                    .cantidadBanos(banos != null ? banos : new BigDecimal("1.0"))
                    .inventarioTotal(1) // Siempre 1 para Casa/Depto
                    .precioNoche(precioNoche != null ? precioNoche : new BigDecimal("400.00"))
                    .estado(com.alojate.usuarios.domain.model.EstadoUnidad.DISPONIBLE)
                    .build();
        } else {
            unidad = unidades.get(0);
            if (precioNoche != null) unidad.setPrecioNoche(precioNoche);
            if (capacidad != null) unidad.setCapacidadHuespedes(capacidad);
            if (dormitorios != null) unidad.setCantidadDormitorios(dormitorios);
            if (camas != null) unidad.setCantidadCamas(camas);
            if (banos != null) unidad.setCantidadBanos(banos);
            unidad.setInventarioTotal(1);
        }
        unidadReservableRepository.guardar(unidad);
        alojamientoRepository.guardar(alojamiento);
        return alojamientoRepository.buscarPorId(idAlojamiento).orElse(alojamiento);
    }

    @Override
    @Transactional
    public UnidadReservable agregarHabitacionHotel(UUID idAlojamiento, String nombre, BigDecimal precioNoche, Integer inventarioTotal, Integer capacidad, Integer dormitorios, Integer camas, BigDecimal banos, Integer idTipoEspacio, List<Fotografia> fotografias) {
        Alojamiento alojamiento = obtenerPorId(idAlojamiento);
        alojamiento.setModalidad("HOTEL_HOSTAL");
        alojamientoRepository.guardar(alojamiento);

        UnidadReservable unidad = UnidadReservable.builder()
                .idAlojamiento(idAlojamiento)
                .nombre(nombre != null ? nombre : "Habitación Estándar")
                .idTipoEspacio(idTipoEspacio != null ? idTipoEspacio : 2)
                .capacidadHuespedes(capacidad != null ? capacidad : 2)
                .cantidadDormitorios(dormitorios != null ? dormitorios : 1)
                .cantidadCamas(camas != null ? camas : 1)
                .cantidadBanos(banos != null ? banos : new BigDecimal("1.0"))
                .inventarioTotal(inventarioTotal != null ? inventarioTotal : 5) // Múltiple inventario
                .precioNoche(precioNoche != null ? precioNoche : new BigDecimal("250.00"))
                .estado(com.alojate.usuarios.domain.model.EstadoUnidad.DISPONIBLE)
                .build();

        UnidadReservable guardada = unidadReservableRepository.guardar(unidad);
        if (fotografias != null && !fotografias.isEmpty()) {
            guardada.setFotografias(fotosHabitacion.reemplazar(guardada, fotografias));
        }
        return guardada;
    }
}
