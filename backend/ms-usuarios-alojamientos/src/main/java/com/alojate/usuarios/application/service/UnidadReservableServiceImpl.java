package com.alojate.usuarios.application.service;

import com.alojate.usuarios.domain.model.EstadoUnidad;
import com.alojate.usuarios.domain.model.UnidadReservable;
import com.alojate.usuarios.domain.ports.in.UnidadReservableUseCase;
import com.alojate.usuarios.domain.ports.out.AlojamientoRepositoryPort;
import com.alojate.usuarios.domain.ports.out.UnidadReservableRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UnidadReservableServiceImpl implements UnidadReservableUseCase {

    private final UnidadReservableRepositoryPort unidadRepo;
    private final AlojamientoRepositoryPort alojamientoRepo;

    @Override
    @Transactional
    public UnidadReservable crearUnidad(UUID idAlojamiento, UnidadReservable unidad) {
        alojamientoRepo.buscarPorId(idAlojamiento)
                .orElseThrow(() -> new RuntimeException("Alojamiento no encontrado con id: " + idAlojamiento));

        unidad.setIdAlojamiento(idAlojamiento);
        if (unidad.getEstado() == null) {
            unidad.setEstado(EstadoUnidad.DISPONIBLE);
        }
        return unidadRepo.guardar(unidad);
    }

    @Override
    @Transactional
    public UnidadReservable actualizarUnidad(UUID idUnidad, UnidadReservable datos) {
        UnidadReservable existente = obtenerPorId(idUnidad);

        if (datos.getNombre() != null) existente.setNombre(datos.getNombre());
        if (datos.getIdTipoEspacio() != null) existente.setIdTipoEspacio(datos.getIdTipoEspacio());
        if (datos.getCapacidadHuespedes() != null) existente.setCapacidadHuespedes(datos.getCapacidadHuespedes());
        if (datos.getCantidadDormitorios() != null) existente.setCantidadDormitorios(datos.getCantidadDormitorios());
        if (datos.getCantidadCamas() != null) existente.setCantidadCamas(datos.getCantidadCamas());
        if (datos.getCantidadBanos() != null) existente.setCantidadBanos(datos.getCantidadBanos());
        if (datos.getInventarioTotal() != null) existente.setInventarioTotal(datos.getInventarioTotal());
        if (datos.getPrecioNoche() != null) existente.setPrecioNoche(datos.getPrecioNoche());
        if (datos.getEstado() != null) existente.setEstado(datos.getEstado());

        return unidadRepo.guardar(existente);
    }

    @Override
    @Transactional
    public UnidadReservable cambiarEstado(UUID idUnidad, EstadoUnidad nuevoEstado) {
        UnidadReservable unidad = obtenerPorId(idUnidad);
        unidad.setEstado(nuevoEstado);
        return unidadRepo.guardar(unidad);
    }

    @Override
    @Transactional
    public void eliminarUnidad(UUID idUnidad) {
        unidadRepo.eliminarPorId(idUnidad);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UnidadReservable> listarPorAlojamiento(UUID idAlojamiento) {
        return unidadRepo.listarPorAlojamiento(idAlojamiento);
    }

    @Override
    @Transactional(readOnly = true)
    public UnidadReservable obtenerPorId(UUID idUnidad) {
        return unidadRepo.buscarPorId(idUnidad)
                .orElseThrow(() -> new RuntimeException("Unidad reservable no encontrada con id: " + idUnidad));
    }
}
