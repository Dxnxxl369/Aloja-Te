package com.alojate.usuarios.domain.ports.out;

import com.alojate.usuarios.domain.model.Permiso;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface PermisoRepositoryPort {
    Permiso guardar(Permiso permiso);
    Optional<Permiso> buscarPorId(Integer idPermiso);
    Optional<Permiso> buscarPorCodigo(String codigo);
    List<Permiso> listarTodos();
    List<Permiso> listarPorModulo(Integer idModulo);
    Set<Permiso> buscarPermisosPorRolId(Integer idRol);
}
