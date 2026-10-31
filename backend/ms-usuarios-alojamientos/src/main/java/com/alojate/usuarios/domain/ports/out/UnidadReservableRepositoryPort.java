package com.alojate.usuarios.domain.ports.out;

import com.alojate.usuarios.domain.model.UnidadReservable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UnidadReservableRepositoryPort {
    UnidadReservable guardar(UnidadReservable unidad);
    Optional<UnidadReservable> buscarPorId(UUID idUnidad);
    List<UnidadReservable> listarPorAlojamiento(UUID idAlojamiento);
    void eliminarPorId(UUID idUnidad);
}
