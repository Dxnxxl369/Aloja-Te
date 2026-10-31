package com.alojate.usuarios.domain.ports.out;

import com.alojate.usuarios.domain.model.RestriccionUsuario;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RestriccionUsuarioRepositoryPort {
    RestriccionUsuario guardar(RestriccionUsuario restriccion);
    Optional<RestriccionUsuario> buscarPorId(UUID idRestriccion);
    List<RestriccionUsuario> listarPorUsuario(UUID idUsuario);
    List<RestriccionUsuario> listarActivasPorUsuario(UUID idUsuario);
}
