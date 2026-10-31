package com.alojate.usuarios.domain.ports.out;

import com.alojate.usuarios.domain.model.Servicio;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface ServicioRepositoryPort {
    Servicio guardar(Servicio servicio);
    Optional<Servicio> buscarPorId(Integer idServicio);
    List<Servicio> listarTodos();
    List<Servicio> listarPorCategoria(String categoria);
    Set<Servicio> buscarPorIds(Set<Integer> ids);
}
