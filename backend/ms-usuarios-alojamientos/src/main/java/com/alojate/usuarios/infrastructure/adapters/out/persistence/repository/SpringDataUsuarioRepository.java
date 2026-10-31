package com.alojate.usuarios.infrastructure.adapters.out.persistence.repository;

import com.alojate.usuarios.infrastructure.adapters.out.persistence.entity.UsuarioJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpringDataUsuarioRepository extends JpaRepository<UsuarioJpaEntity, UUID> {
    Optional<UsuarioJpaEntity> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByCi(String ci);
}
