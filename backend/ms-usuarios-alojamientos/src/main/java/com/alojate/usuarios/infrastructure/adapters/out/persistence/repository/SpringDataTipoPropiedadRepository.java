package com.alojate.usuarios.infrastructure.adapters.out.persistence.repository;

import com.alojate.usuarios.infrastructure.adapters.out.persistence.entity.TipoPropiedadJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SpringDataTipoPropiedadRepository extends JpaRepository<TipoPropiedadJpaEntity, Integer> {
    Optional<TipoPropiedadJpaEntity> findByNombreIgnoreCase(String nombre);
}
