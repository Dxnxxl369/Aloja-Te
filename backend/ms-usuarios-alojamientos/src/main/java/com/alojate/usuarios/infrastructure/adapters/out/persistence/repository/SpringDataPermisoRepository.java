package com.alojate.usuarios.infrastructure.adapters.out.persistence.repository;

import com.alojate.usuarios.infrastructure.adapters.out.persistence.entity.PermisoJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface SpringDataPermisoRepository extends JpaRepository<PermisoJpaEntity, Integer> {
    Optional<PermisoJpaEntity> findByCodigo(String codigo);
    List<PermisoJpaEntity> findByIdModulo(Integer idModulo);

    @Query("SELECT r.permisos FROM RolJpaEntity r WHERE r.idRol = :idRol")
    Set<PermisoJpaEntity> findPermisosByRolId(@Param("idRol") Integer idRol);
}
