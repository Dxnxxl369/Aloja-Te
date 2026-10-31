package com.alojate.usuarios.infrastructure.adapters.out.persistence.repository;

import com.alojate.usuarios.infrastructure.adapters.out.persistence.entity.FotografiaJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpringDataFotografiaRepository extends JpaRepository<FotografiaJpaEntity, UUID> {
    List<FotografiaJpaEntity> findByIdAlojamientoOrderByOrdenAsc(UUID idAlojamiento);
}
