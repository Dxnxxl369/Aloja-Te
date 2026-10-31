package com.alojate.usuarios.infrastructure.adapters.out.persistence.repository;

import com.alojate.usuarios.infrastructure.adapters.out.persistence.entity.ServicioJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface SpringDataServicioRepository extends JpaRepository<ServicioJpaEntity, Integer> {
    Optional<ServicioJpaEntity> findByNombreIgnoreCase(String nombre);
    List<ServicioJpaEntity> findByCategoriaIgnoreCase(String categoria);
    Set<ServicioJpaEntity> findByIdServicioIn(Set<Integer> ids);
}
