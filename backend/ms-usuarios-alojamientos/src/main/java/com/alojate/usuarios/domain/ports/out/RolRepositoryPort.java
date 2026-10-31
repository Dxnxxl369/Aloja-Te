package com.alojate.usuarios.domain.ports.out;

import com.alojate.usuarios.domain.model.Rol;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface RolRepositoryPort {
    Rol guardar(Rol rol);
    Optional<Rol> buscarPorId(Integer idRol);
    Optional<Rol> buscarPorNombre(String nombre);
    List<Rol> listarTodos();
    void sincronizarPermisos(Integer idRol, Set<Integer> idsPermisos);
}
