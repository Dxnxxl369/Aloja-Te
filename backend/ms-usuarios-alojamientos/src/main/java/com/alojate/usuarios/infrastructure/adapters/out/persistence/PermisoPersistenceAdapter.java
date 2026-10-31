package com.alojate.usuarios.infrastructure.adapters.out.persistence;

import com.alojate.usuarios.domain.model.Permiso;
import com.alojate.usuarios.domain.ports.out.PermisoRepositoryPort;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.entity.PermisoJpaEntity;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.repository.SpringDataPermisoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PermisoPersistenceAdapter implements PermisoRepositoryPort {

    private final SpringDataPermisoRepository permisoRepo;

    @Override
    public Permiso guardar(Permiso permiso) {
        PermisoJpaEntity entity = PermisoJpaEntity.builder()
                .idPermiso(permiso.getIdPermiso())
                .idModulo(permiso.getIdModulo())
                .codigo(permiso.getCodigo())
                .nombre(permiso.getNombre())
                .descripcion(permiso.getDescripcion())
                .asignable(permiso.getAsignable() != null ? permiso.getAsignable() : true)
                .build();
        return toDomain(permisoRepo.save(entity));
    }

    @Override
    public Optional<Permiso> buscarPorId(Integer idPermiso) {
        return permisoRepo.findById(idPermiso).map(this::toDomain);
    }

    @Override
    public Optional<Permiso> buscarPorCodigo(String codigo) {
        return permisoRepo.findByCodigo(codigo).map(this::toDomain);
    }

    @Override
    public List<Permiso> listarTodos() {
        return permisoRepo.findAll().stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    public List<Permiso> listarPorModulo(Integer idModulo) {
        return permisoRepo.findByIdModulo(idModulo).stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    public Set<Permiso> buscarPermisosPorRolId(Integer idRol) {
        return permisoRepo.findPermisosByRolId(idRol).stream().map(this::toDomain).collect(Collectors.toSet());
    }

    private Permiso toDomain(PermisoJpaEntity entity) {
        if (entity == null) return null;
        return Permiso.builder()
                .idPermiso(entity.getIdPermiso())
                .idModulo(entity.getIdModulo())
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .asignable(entity.getAsignable())
                .build();
    }
}
