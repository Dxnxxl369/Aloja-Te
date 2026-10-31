package com.alojate.usuarios.infrastructure.adapters.out.persistence.repository;

import com.alojate.usuarios.infrastructure.adapters.out.persistence.entity.ValoracionJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpringDataValoracionRepository extends JpaRepository<ValoracionJpaEntity, UUID> {

    // Reseñas de un alojamiento (todas o generales si id_unidad es null)
    List<ValoracionJpaEntity> findByIdAlojamientoOrderByFechaCreacionDesc(UUID idAlojamiento);

    // Reseñas exclusivas generales del Hotel (donde id_unidad es null)
    List<ValoracionJpaEntity> findByIdAlojamientoAndIdUnidadIsNullOrderByFechaCreacionDesc(UUID idAlojamiento);

    // Reseñas exclusivas de una habitación específica del Hotel
    List<ValoracionJpaEntity> findByIdUnidadOrderByFechaCreacionDesc(UUID idUnidad);

    // Conteo y promedios por alojamiento
    @Query("SELECT COUNT(v), AVG(v.puntuacionGeneral) FROM ValoracionJpaEntity v WHERE v.idAlojamiento = :idAlojamiento")
    List<Object[]> obtenerMetricasAlojamiento(@Param("idAlojamiento") UUID idAlojamiento);

    // Conteo y promedios por habitación
    @Query("SELECT COUNT(v), AVG(v.puntuacionGeneral) FROM ValoracionJpaEntity v WHERE v.idUnidad = :idUnidad")
    List<Object[]> obtenerMetricasUnidad(@Param("idUnidad") UUID idUnidad);
}
