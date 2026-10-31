package com.alojate.usuarios.domain.ports.out;

import com.alojate.usuarios.domain.model.Modulo;

import java.util.List;
import java.util.Optional;

public interface ModuloRepositoryPort {
    Modulo guardar(Modulo modulo);
    Optional<Modulo> buscarPorId(Integer idModulo);
    List<Modulo> listarTodos();
}
