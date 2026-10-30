package com.alojate.usuarios.domain.ports.in;

import com.alojate.usuarios.domain.model.EstadoUnidad;
import com.alojate.usuarios.domain.model.UnidadReservable;

import java.util.List;
import java.util.UUID;

public interface UnidadReservableUseCase {
    UnidadReservable crearUnidad(UUID idAlojamiento, UnidadReservable unidad);
    UnidadReservable actualizarUnidad(UUID idUnidad, UnidadReservable unidad);
    UnidadReservable cambiarEstado(UUID idUnidad, EstadoUnidad nuevoEstado);
    void eliminarUnidad(UUID idUnidad);
    List<UnidadReservable> listarPorAlojamiento(UUID idAlojamiento);
    UnidadReservable obtenerPorId(UUID idUnidad);
}
