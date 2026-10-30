package com.alojate.usuarios.domain.ports.in;

import com.alojate.usuarios.domain.model.Modulo;
import com.alojate.usuarios.domain.model.Permiso;
import com.alojate.usuarios.domain.model.RestriccionUsuario;
import com.alojate.usuarios.domain.model.Rol;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface SeguridadUseCase {
    // Modulos
    Modulo crearModulo(Modulo modulo);
    List<Modulo> listarModulos();
    Modulo obtenerModulo(Integer idModulo);

    // Permisos
    Permiso crearPermiso(Permiso permiso);
    List<Permiso> listarPermisos();
    List<Permiso> listarPermisosPorModulo(Integer idModulo);
    Set<Permiso> listarPermisosPorRol(Integer idRol);

    // Roles
    Rol crearRol(Rol rol);
    List<Rol> listarRoles();
    Rol obtenerRol(Integer idRol);
    Rol asignarPermisosARol(Integer idRol, Set<Integer> idsPermisos);

    // Restricciones de Usuario
    RestriccionUsuario aplicarRestriccion(UUID idUsuario, Integer idPermiso, UUID idAdministrador, String motivo, LocalDateTime inicio, LocalDateTime fin);
    void desactivarRestriccion(UUID idRestriccion);
    List<RestriccionUsuario> listarRestriccionesDeUsuario(UUID idUsuario);
    boolean usuarioTienePermisoActivo(UUID idUsuario, String codigoPermiso);
}
