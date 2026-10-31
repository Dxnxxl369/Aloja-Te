package com.alojate.usuarios.infrastructure.adapters.out.persistence;

import com.alojate.usuarios.domain.model.RestriccionUsuario;
import com.alojate.usuarios.domain.ports.out.RestriccionUsuarioRepositoryPort;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.entity.RestriccionUsuarioJpaEntity;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.repository.SpringDataRestriccionUsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class RestriccionUsuarioPersistenceAdapter implements RestriccionUsuarioRepositoryPort {

    private final SpringDataRestriccionUsuarioRepository restriccionRepo;

    @Override
    public RestriccionUsuario guardar(RestriccionUsuario restriccion) {
        RestriccionUsuarioJpaEntity entity = RestriccionUsuarioJpaEntity.builder()
                .idRestriccion(restriccion.getIdRestriccion())
                .idUsuario(restriccion.getIdUsuario())
                .idPermiso(restriccion.getIdPermiso())
                .idAdministrador(restriccion.getIdAdministrador())
                .motivo(restriccion.getMotivo())
                .fechaInicio(restriccion.getFechaInicio())
                .fechaFin(restriccion.getFechaFin())
                .activa(restriccion.getActiva() != null ? restriccion.getActiva() : true)
                .build();
        return toDomain(restriccionRepo.save(entity));
    }

    @Override
    public Optional<RestriccionUsuario> buscarPorId(UUID idRestriccion) {
        return restriccionRepo.findById(idRestriccion).map(this::toDomain);
    }

    @Override
    public List<RestriccionUsuario> listarPorUsuario(UUID idUsuario) {
        return restriccionRepo.findByIdUsuario(idUsuario).stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    public List<RestriccionUsuario> listarActivasPorUsuario(UUID idUsuario) {
        return restriccionRepo.findByIdUsuarioAndActivaTrue(idUsuario).stream().map(this::toDomain).collect(Collectors.toList());
    }

    private RestriccionUsuario toDomain(RestriccionUsuarioJpaEntity entity) {
        if (entity == null) return null;
        return RestriccionUsuario.builder()
                .idRestriccion(entity.getIdRestriccion())
                .idUsuario(entity.getIdUsuario())
                .idPermiso(entity.getIdPermiso())
                .idAdministrador(entity.getIdAdministrador())
                .motivo(entity.getMotivo())
                .fechaInicio(entity.getFechaInicio())
                .fechaFin(entity.getFechaFin())
                .activa(entity.getActiva())
                .build();
    }
}
