package com.alojate.usuarios.domain.ports.in;

import com.alojate.usuarios.domain.model.Valoracion;

import java.util.List;
import java.util.UUID;

public interface ValoracionUseCase {
    Valoracion registrarValoracion(Valoracion valoracion);
    List<Valoracion> listarPorAlojamiento(UUID idAlojamiento);
    List<Valoracion> listarGeneralesHotel(UUID idAlojamiento);
    List<Valoracion> listarPorUnidad(UUID idUnidad);
}
