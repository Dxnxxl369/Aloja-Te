package com.alojate.usuarios.application.service;

import com.alojate.usuarios.domain.model.Modulo;
import com.alojate.usuarios.domain.model.Permiso;
import com.alojate.usuarios.domain.model.RestriccionUsuario;
import com.alojate.usuarios.domain.model.Rol;
import com.alojate.usuarios.domain.ports.in.SeguridadUseCase;
import com.alojate.usuarios.domain.ports.out.ModuloRepositoryPort;
import com.alojate.usuarios.domain.ports.out.PermisoRepositoryPort;
import com.alojate.usuarios.domain.ports.out.RestriccionUsuarioRepositoryPort;
import com.alojate.usuarios.domain.ports.out.RolRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SeguridadServiceImpl implements SeguridadUseCase {

    private final ModuloRepositoryPort moduloRepo;
    private final PermisoRepositoryPort permisoRepo;
    private final RolRepositoryPort rolRepo;
    private final RestriccionUsuarioRepositoryPort restriccionRepo;

    // --- MODULOS ---
    @Override
    @Transactional
    public Modulo crearModulo(Modulo modulo) {
        return moduloRepo.guardar(modulo);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Modulo> listarModulos() {
        return moduloRepo.listarTodos();
    }

    @Override
    @Transactional(readOnly = true)
    public Modulo obtenerModulo(Integer idModulo) {
        return moduloRepo.buscarPorId(idModulo)
                .orElseThrow(() -> new RuntimeException("Modulo no encontrado con id: " + idModulo));
    }

    // --- PERMISOS ---
    @Override
    @Transactional
    public Permiso crearPermiso(Permiso permiso) {
        return permisoRepo.guardar(permiso);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Permiso> listarPermisos() {
        return permisoRepo.listarTodos();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Permiso> listarPermisosPorModulo(Integer idModulo) {
        return permisoRepo.listarPorModulo(idModulo);
    }

    @Override
    @Transactional(readOnly = true)
    public Set<Permiso> listarPermisosPorRol(Integer idRol) {
        return permisoRepo.buscarPermisosPorRolId(idRol);
    }

    // --- ROLES ---
    @Override
    @Transactional
    public Rol crearRol(Rol rol) {
        if (rol.getActivo() == null) rol.setActivo(true);
        if (rol.getEsSistema() == null) rol.setEsSistema(false);
        return rolRepo.guardar(rol);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Rol> listarRoles() {
        return rolRepo.listarTodos();
    }

    @Override
    @Transactional(readOnly = true)
    public Rol obtenerRol(Integer idRol) {
        return rolRepo.buscarPorId(idRol)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado con id: " + idRol));
    }

    @Override
    @Transactional
    public Rol asignarPermisosARol(Integer idRol, Set<Integer> idsPermisos) {
        rolRepo.sincronizarPermisos(idRol, idsPermisos);
        return obtenerRol(idRol);
    }

    // --- RESTRICCIONES ---
    @Override
    @Transactional
    public RestriccionUsuario aplicarRestriccion(UUID idUsuario, Integer idPermiso, UUID idAdministrador, String motivo, LocalDateTime inicio, LocalDateTime fin) {
        RestriccionUsuario restriccion = RestriccionUsuario.builder()
                .idUsuario(idUsuario)
                .idPermiso(idPermiso)
                .idAdministrador(idAdministrador)
                .motivo(motivo)
                .fechaInicio(inicio != null ? inicio : LocalDateTime.now())
                .fechaFin(fin)
                .activa(true)
                .build();
        return restriccionRepo.guardar(restriccion);
    }

    @Override
    @Transactional
    public void desactivarRestriccion(UUID idRestriccion) {
        restriccionRepo.buscarPorId(idRestriccion).ifPresent(r -> {
            r.setActiva(false);
            restriccionRepo.guardar(r);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public List<RestriccionUsuario> listarRestriccionesDeUsuario(UUID idUsuario) {
        return restriccionRepo.listarPorUsuario(idUsuario);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean usuarioTienePermisoActivo(UUID idUsuario, String codigoPermiso) {
        // Verificar si existe una restricción activa para este permiso sobre este usuario
        List<RestriccionUsuario> activas = restriccionRepo.listarActivasPorUsuario(idUsuario);
        LocalDateTime ahora = LocalDateTime.now();

        return activas.stream().noneMatch(r -> {
            if (!r.estaVigente(ahora)) return false;
            return permisoRepo.buscarPorId(r.getIdPermiso())
                    .map(p -> p.getCodigo().equalsIgnoreCase(codigoPermiso))
                    .orElse(false);
        });
    }
}
