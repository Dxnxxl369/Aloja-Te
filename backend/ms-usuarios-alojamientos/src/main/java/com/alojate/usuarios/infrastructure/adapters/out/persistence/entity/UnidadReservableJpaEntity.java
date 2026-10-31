package com.alojate.usuarios.infrastructure.adapters.out.persistence.entity;

import com.alojate.usuarios.domain.model.EstadoUnidad;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "unidades_reservables", indexes = {
        @Index(name = "idx_unidad_alojamiento", columnList = "id_alojamiento")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnidadReservableJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_unidad", updatable = false, nullable = false)
    private UUID idUnidad;

    @Column(name = "id_alojamiento", nullable = false)
    private UUID idAlojamiento;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_tipo_espacio", nullable = false)
    private TipoEspacioJpaEntity tipoEspacio;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(name = "capacidad_huespedes", nullable = false)
    private Integer capacidadHuespedes;

    @Column(name = "cantidad_dormitorios", nullable = false)
    private Integer cantidadDormitorios;

    @Column(name = "cantidad_camas", nullable = false)
    private Integer cantidadCamas;

    @Column(name = "cantidad_banos", precision = 3, scale = 1, nullable = false)
    private BigDecimal cantidadBanos;

    @Column(name = "inventario_total", nullable = false)
    private Integer inventarioTotal;

    @Column(name = "precio_noche", precision = 12, scale = 2, nullable = false)
    private BigDecimal precioNoche;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoUnidad estado;
}
