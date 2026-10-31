package com.alojate.usuarios.domain.ports.out;

import com.alojate.usuarios.domain.model.Valoracion;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ValoracionRepositoryPort {
    Valoracion guardar(Valoracion valoracion);
    Optional<Valoracion> buscarPorId(UUID id);
    List<Valoracion> listarPorAlojamiento(UUID idAlojamiento);
    List<Valoracion> listarGeneralesHotel(UUID idAlojamiento);
    List<Valoracion> listarPorUnidad(UUID idUnidad);
}
