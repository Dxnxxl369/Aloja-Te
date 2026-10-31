package com.alojate.usuarios.infrastructure.adapters.out.persistence.repository;

import com.alojate.usuarios.infrastructure.adapters.out.persistence.entity.ModuloJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpringDataModuloRepository extends JpaRepository<ModuloJpaEntity, Integer> {
    List<ModuloJpaEntity> findAllByOrderByOrdenAsc();
}
