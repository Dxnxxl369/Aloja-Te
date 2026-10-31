package com.alojate.usuarios.infrastructure.adapters.out.persistence.repository;

import com.alojate.usuarios.infrastructure.adapters.out.persistence.entity.RolJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SpringDataRolRepository extends JpaRepository<RolJpaEntity, Integer> {
    Optional<RolJpaEntity> findByNombreIgnoreCase(String nombre);
}
