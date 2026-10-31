package com.alojate.usuarios.domain.ports.out;

import com.alojate.usuarios.domain.model.Usuario;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UsuarioRepositoryPort {
    Usuario guardar(Usuario usuario);
    Optional<Usuario> buscarPorEmail(String email);
    Optional<Usuario> buscarPorId(UUID id);
    boolean existePorEmail(String email);
    boolean existePorCi(String ci);
    List<Usuario> listarTodos();
}
