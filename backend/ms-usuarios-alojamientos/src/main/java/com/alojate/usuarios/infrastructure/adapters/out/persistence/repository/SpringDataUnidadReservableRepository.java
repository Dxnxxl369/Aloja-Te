package com.alojate.usuarios.infrastructure.adapters.out.persistence.repository;

import com.alojate.usuarios.infrastructure.adapters.out.persistence.entity.UnidadReservableJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpringDataUnidadReservableRepository extends JpaRepository<UnidadReservableJpaEntity, UUID> {
    List<UnidadReservableJpaEntity> findByIdAlojamiento(UUID idAlojamiento);
}
