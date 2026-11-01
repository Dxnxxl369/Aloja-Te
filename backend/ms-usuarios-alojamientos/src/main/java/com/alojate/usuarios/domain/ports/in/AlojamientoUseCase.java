package com.alojate.usuarios.domain.ports.in;

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
    Alojamiento cambiarEstado(UUID idAlojamiento, EstadoPublicacion nuevoEstado);
    Alojamiento cambiarEstado(UUID idAlojamiento, EstadoPublicacion nuevoEstado, String motivo, String origen);
    Alojamiento observarAlojamiento(UUID idAlojamiento, String motivo, String origen);
    List<Alojamiento> listarPorEstado(EstadoPublicacion estado);
    Alojamiento obtenerPorId(UUID idAlojamiento);
    List<Alojamiento> listarTodos();
    List<Alojamiento> listarPorAnfitrion(UUID idAnfitrion);
    List<Alojamiento> buscarPublicados(String ciudad, String departamento, Integer idTipoPropiedad, BigDecimal precioMax, Integer minHuespedes);

    // Moderación Administrativa (Bandeja de Moderación)
    List<Alojamiento> listarPendientesModeracion();
    Alojamiento aceptarAlojamiento(UUID idAlojamiento);
    Alojamiento rechazarAlojamiento(UUID idAlojamiento, String motivo);
    Alojamiento suspenderAlojamiento(UUID idAlojamiento, String motivo);
    Alojamiento enviarARevision(UUID idAlojamiento);

    // Modalidad Casa vs Hotel
    Alojamiento configurarOfertaUnica(UUID idAlojamiento, BigDecimal precioNoche, Integer capacidad, Integer dormitorios, Integer camas, BigDecimal banos);
    com.alojate.usuarios.domain.model.UnidadReservable agregarHabitacionHotel(UUID idAlojamiento, String nombre, BigDecimal precioNoche, Integer inventarioTotal, Integer capacidad, Integer dormitorios, Integer camas, BigDecimal banos, Integer idTipoEspacio);

    // Fotografías
    Fotografia agregarFotografia(UUID idAlojamiento, String url, Integer orden);
    void eliminarFotografia(UUID idFotografia);
    List<Fotografia> listarFotografias(UUID idAlojamiento);
}
