package com.alojate.usuarios.infrastructure.adapters.out.persistence.repository;

import com.alojate.usuarios.infrastructure.adapters.out.persistence.entity.EmpresaJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpringDataEmpresaRepository extends JpaRepository<EmpresaJpaEntity, UUID> {
    Optional<EmpresaJpaEntity> findFirstByActivoTrue();
}
