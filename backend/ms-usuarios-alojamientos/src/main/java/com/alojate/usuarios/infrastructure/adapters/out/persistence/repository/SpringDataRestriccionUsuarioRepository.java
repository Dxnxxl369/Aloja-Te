package com.alojate.usuarios.infrastructure.adapters.out.persistence.repository;

import com.alojate.usuarios.infrastructure.adapters.out.persistence.entity.RestriccionUsuarioJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpringDataRestriccionUsuarioRepository extends JpaRepository<RestriccionUsuarioJpaEntity, UUID> {
    List<RestriccionUsuarioJpaEntity> findByIdUsuario(UUID idUsuario);
    List<RestriccionUsuarioJpaEntity> findByIdUsuarioAndActivaTrue(UUID idUsuario);
}
