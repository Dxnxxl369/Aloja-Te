package com.alojate.usuarios.infrastructure.adapters.out.persistence.repository;

import com.alojate.usuarios.domain.model.EstadoPublicacion;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.entity.AlojamientoJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface SpringDataAlojamientoRepository extends JpaRepository<AlojamientoJpaEntity, UUID> {

    List<AlojamientoJpaEntity> findByIdAnfitrion(UUID idAnfitrion);

    List<AlojamientoJpaEntity> findByEstadoPublicacion(EstadoPublicacion estadoPublicacion);

    @Query("SELECT DISTINCT a FROM AlojamientoJpaEntity a " +
           "LEFT JOIN a.unidades u " +
           "WHERE (a.estadoPublicacion = com.alojate.usuarios.domain.model.EstadoPublicacion.PUBLICADO " +
           "   OR (a.estadoPublicacion = com.alojate.usuarios.domain.model.EstadoPublicacion.OBSERVADO AND (LOWER(a.origenUltimoCambio) LIKE '%nlp%' OR LOWER(a.origenUltimoCambio) LIKE '%resena%'))) " +
           "AND (:ciudad IS NULL OR LOWER(a.ciudad) LIKE LOWER(CONCAT('%', :ciudad, '%'))) " +
           "AND (:departamento IS NULL OR LOWER(a.departamento) LIKE LOWER(CONCAT('%', :departamento, '%'))) " +
           "AND (:idTipoPropiedad IS NULL OR a.tipoPropiedad.idTipoPropiedad = :idTipoPropiedad) " +
           "AND (:precioMax IS NULL OR u.precioNoche <= :precioMax) " +
           "AND (:minHuespedes IS NULL OR u.capacidadHuespedes >= :minHuespedes)")
    List<AlojamientoJpaEntity> buscarAvanzada(
            @Param("ciudad") String ciudad,
            @Param("departamento") String departamento,
            @Param("idTipoPropiedad") Integer idTipoPropiedad,
            @Param("precioMax") BigDecimal precioMax,
            @Param("minHuespedes") Integer minHuespedes
    );
}
