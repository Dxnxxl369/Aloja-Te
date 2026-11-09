package com.alojate.usuarios.domain.ports.in;

import com.alojate.usuarios.domain.model.ActorPublicacion;
import com.alojate.usuarios.domain.model.Alojamiento;
import com.alojate.usuarios.domain.model.EstadoPublicacion;
import com.alojate.usuarios.domain.model.Fotografia;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface AlojamientoUseCase {
    Alojamiento crearAlojamiento(Alojamiento alojamiento, Set<Integer> serviciosIds);
    Alojamiento actualizarAlojamiento(UUID idAlojamiento, Alojamiento alojamiento, Set<Integer> serviciosIds);
    List<Alojamiento> listarPorEstado(EstadoPublicacion estado);
    Alojamiento obtenerPorId(UUID idAlojamiento);
    List<Alojamiento> listarTodos();
    List<Alojamiento> listarPorAnfitrion(UUID idAnfitrion);
    List<Alojamiento> buscarPublicados(String ciudad, String departamento, Integer idTipoPropiedad, BigDecimal precioMax, Integer minHuespedes);

    // Ciclo de publicación: todos los cambios de estado pasan por MaquinaEstadosPublicacion
    List<Alojamiento> listarPendientesModeracion();
    List<Alojamiento> listarRequierenAtencion();

    /** Decisión informada por la IA (n8n) o por el análisis de reseñas (NLP). {@code idRevision} es opcional. */
    Alojamiento cambiarEstado(UUID idAlojamiento, EstadoPublicacion destino, String motivo, String origen,
                              ActorPublicacion actor, UUID idRevision);
    /** Inicia la revisión automática (registro completo, o reenvío del anfitrión si está OBSERVADO). */
    Alojamiento enviarARevision(UUID idAlojamiento);
    /** El admin reintenta una revisión que agotó sus intentos. */
    Alojamiento reintentarRevision(UUID idAlojamiento);
    /** Tiempo agotado: devuelve una revisión que no respondió a PENDIENTE y suma un intento. */
    Alojamiento vencerRevision(UUID idAlojamiento);
    Alojamiento suspenderAlojamiento(UUID idAlojamiento, String motivo);
    Alojamiento reactivarAlojamiento(UUID idAlojamiento);

    // Modalidad Casa vs Hotel
    Alojamiento configurarOfertaUnica(UUID idAlojamiento, BigDecimal precioNoche, Integer capacidad, Integer dormitorios, Integer camas, BigDecimal banos);
    com.alojate.usuarios.domain.model.UnidadReservable agregarHabitacionHotel(UUID idAlojamiento, String nombre, BigDecimal precioNoche, Integer inventarioTotal, Integer capacidad, Integer dormitorios, Integer camas, BigDecimal banos, Integer idTipoEspacio, List<Fotografia> fotografias);

    // Fotografías
    Fotografia agregarFotografia(UUID idAlojamiento, String url, Integer orden);
    void eliminarFotografia(UUID idFotografia);
    List<Fotografia> listarFotografias(UUID idAlojamiento);
}
