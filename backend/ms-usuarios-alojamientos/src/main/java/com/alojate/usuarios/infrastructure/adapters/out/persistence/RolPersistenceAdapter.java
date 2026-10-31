package com.alojate.usuarios.infrastructure.adapters.out.persistence;

import com.alojate.usuarios.domain.model.Permiso;
import com.alojate.usuarios.domain.model.Rol;
import com.alojate.usuarios.domain.ports.out.RolRepositoryPort;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.entity.PermisoJpaEntity;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.entity.RolJpaEntity;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.repository.SpringDataPermisoRepository;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.repository.SpringDataRolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class RolPersistenceAdapter implements RolRepositoryPort {

    private final SpringDataRolRepository rolRepo;
    private final SpringDataPermisoRepository permisoRepo;

    @Override
    public Rol guardar(Rol rol) {
        RolJpaEntity entity = RolJpaEntity.builder()
                .idRol(rol.getIdRol())
                .nombre(rol.getNombre())
                .ambito(rol.getAmbito())
                .esSistema(rol.getEsSistema() != null ? rol.getEsSistema() : false)
                .activo(rol.getActivo() != null ? rol.getActivo() : true)
                .build();
        return toDomain(rolRepo.save(entity));
    }

    @Override
    public Optional<Rol> buscarPorId(Integer idRol) {
        return rolRepo.findById(idRol).map(this::toDomain);
    }

    @Override
    public Optional<Rol> buscarPorNombre(String nombre) {
        return rolRepo.findByNombreIgnoreCase(nombre).map(this::toDomain);
    }

    @Override
    public List<Rol> listarTodos() {
        return rolRepo.findAll().stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void sincronizarPermisos(Integer idRol, Set<Integer> idsPermisos) {
        rolRepo.findById(idRol).ifPresent(rolEntity -> {
            Set<PermisoJpaEntity> permisos = new HashSet<>(permisoRepo.findAllById(idsPermisos));
            rolEntity.setPermisos(permisos);
            rolRepo.save(rolEntity);
        });
    }

    private Rol toDomain(RolJpaEntity entity) {
        if (entity == null) return null;
        Set<Permiso> permisosDomain = entity.getPermisos() != null
                ? entity.getPermisos().stream().map(p -> Permiso.builder()
                        .idPermiso(p.getIdPermiso())
                        .idModulo(p.getIdModulo())
                        .codigo(p.getCodigo())
                        .nombre(p.getNombre())
                        .descripcion(p.getDescripcion())
                        .asignable(p.getAsignable())
                        .build()).collect(Collectors.toSet())
                : new HashSet<>();

        return Rol.builder()
                .idRol(entity.getIdRol())
                .nombre(entity.getNombre())
                .ambito(entity.getAmbito())
                .esSistema(entity.getEsSistema())
                .activo(entity.getActivo())
                .permisos(permisosDomain)
                .build();
    }
}
