package com.alojate.usuarios.application.service;

import com.alojate.usuarios.domain.model.Alojamiento;
import com.alojate.usuarios.domain.model.EstadoPublicacion;
import com.alojate.usuarios.domain.model.Fotografia;
import com.alojate.usuarios.domain.model.UnidadReservable;
import com.alojate.usuarios.domain.ports.in.AlojamientoUseCase;
import com.alojate.usuarios.domain.ports.out.AlojamientoRepositoryPort;
import com.alojate.usuarios.domain.ports.out.FotografiaRepositoryPort;
import com.alojate.usuarios.domain.ports.out.UnidadReservableRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AlojamientoServiceImpl implements AlojamientoUseCase {

    private final AlojamientoRepositoryPort alojamientoRepository;
    private final FotografiaRepositoryPort fotografiaRepository;
    private final UnidadReservableRepositoryPort unidadReservableRepository;

    @Override
    @Transactional
    public Alojamiento crearAlojamiento(Alojamiento alojamiento, Set<Integer> serviciosIds) {
        if (alojamiento.getEstadoPublicacion() == null) {
            alojamiento.setEstadoPublicacion(EstadoPublicacion.BORRADOR);
        }
        alojamiento.setFechaCreacion(LocalDateTime.now());
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
    @Transactional
    public Alojamiento cambiarEstado(UUID idAlojamiento, EstadoPublicacion nuevoEstado) {
        Alojamiento alojamiento = obtenerPorId(idAlojamiento);
        alojamiento.setEstadoPublicacion(nuevoEstado);
        return alojamientoRepository.guardar(alojamiento);
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
        Fotografia foto = Fotografia.builder()
                .idAlojamiento(idAlojamiento)
                .url(url)
                .orden(orden != null ? orden : 0)
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
        return fotografiaRepository.listarPorAlojamiento(idAlojamiento);
    }

    // --- BANDEJA DE MODERACIÓN ADMINISTRATIVA ---
    @Override
    @Transactional(readOnly = true)
    public List<Alojamiento> listarPendientesModeracion() {
        return alojamientoRepository.listarPorEstado(EstadoPublicacion.EN_REVISION);
    }

    @Override
    @Transactional
    public Alojamiento aceptarAlojamiento(UUID idAlojamiento) {
        Alojamiento alojamiento = obtenerPorId(idAlojamiento);
        alojamiento.setEstadoPublicacion(EstadoPublicacion.PUBLICADO);
        alojamiento.setMotivoRechazo(null);
        return alojamientoRepository.guardar(alojamiento);
    }

    @Override
    @Transactional
    public Alojamiento rechazarAlojamiento(UUID idAlojamiento, String motivo) {
        Alojamiento alojamiento = obtenerPorId(idAlojamiento);
        alojamiento.setEstadoPublicacion(EstadoPublicacion.RECHAZADO);
        alojamiento.setMotivoRechazo(motivo != null ? motivo.trim() : "No cumple con las normas de habitabilidad y calidad.");
        return alojamientoRepository.guardar(alojamiento);
    }

    @Override
    @Transactional
    public Alojamiento suspenderAlojamiento(UUID idAlojamiento, String motivo) {
        Alojamiento alojamiento = obtenerPorId(idAlojamiento);
        alojamiento.setEstadoPublicacion(EstadoPublicacion.SUSPENDIDO);
        alojamiento.setMotivoRechazo(motivo != null ? motivo.trim() : "Publicación suspendida por auditoría.");
        return alojamientoRepository.guardar(alojamiento);
    }

    @Override
    @Transactional
    public Alojamiento enviarARevision(UUID idAlojamiento) {
        Alojamiento alojamiento = obtenerPorId(idAlojamiento);
        alojamiento.setEstadoPublicacion(EstadoPublicacion.EN_REVISION);
        return alojamientoRepository.guardar(alojamiento);
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
    public UnidadReservable agregarHabitacionHotel(UUID idAlojamiento, String nombre, BigDecimal precioNoche, Integer inventarioTotal, Integer capacidad, Integer dormitorios, Integer camas, BigDecimal banos, Integer idTipoEspacio) {
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

        return unidadReservableRepository.guardar(unidad);
    }
}
