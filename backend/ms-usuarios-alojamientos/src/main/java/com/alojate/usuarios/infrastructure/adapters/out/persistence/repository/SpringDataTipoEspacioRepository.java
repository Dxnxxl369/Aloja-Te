package com.alojate.usuarios.infrastructure.adapters.out.persistence.repository;

import com.alojate.usuarios.infrastructure.adapters.out.persistence.entity.TipoEspacioJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SpringDataTipoEspacioRepository extends JpaRepository<TipoEspacioJpaEntity, Integer> {
    Optional<TipoEspacioJpaEntity> findByNombreIgnoreCase(String nombre);
}
