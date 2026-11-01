package com.alojate.usuarios.infrastructure.adapters.out.persistence.entity;

import com.alojate.usuarios.domain.model.EstadoPublicacion;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "alojamientos", indexes = {
        @Index(name = "idx_aloj_anfitrion", columnList = "id_anfitrion"),
        @Index(name = "idx_aloj_ciudad", columnList = "ciudad"),
        @Index(name = "idx_aloj_depto", columnList = "departamento"),
        @Index(name = "idx_aloj_estado", columnList = "estado_publicacion")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlojamientoJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_alojamiento", updatable = false, nullable = false)
    private UUID idAlojamiento;

    @Column(name = "id_anfitrion", nullable = false)
    private UUID idAnfitrion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_tipo_propiedad", nullable = false)
    private TipoPropiedadJpaEntity tipoPropiedad;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(nullable = false, length = 255)
    private String direccion;

    @Column(nullable = false, length = 100)
    private String ciudad;

    @Column(nullable = false, length = 100)
    private String departamento;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitud;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitud;

    @Column(length = 30)
    private String modalidad; // "CASA_DEPARTAMENTO" o "HOTEL_HOSTAL"

    @Column(columnDefinition = "TEXT")
    private String politicas;

    @Column(name = "horario_entrada", length = 20)
    private String horarioEntrada;

    @Column(name = "horario_salida", length = 20)
    private String horarioSalida;

    @Column(name = "motivo_rechazo", columnDefinition = "TEXT")
    private String motivoRechazo;

    @Column(name = "motivo_observacion_rechazo", columnDefinition = "TEXT")
    private String motivoObservacionRechazo;

    @Column(name = "origen_ultimo_cambio", length = 100)
    private String origenUltimoCambio;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_publicacion", nullable = false, length = 30)
    private EstadoPublicacion estadoPublicacion;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "alojamiento_servicio",
            joinColumns = @JoinColumn(name = "id_alojamiento"),
            inverseJoinColumns = @JoinColumn(name = "id_servicio")
    )
    @Builder.Default
    private Set<ServicioJpaEntity> servicios = new HashSet<>();

    @OneToMany(mappedBy = "idAlojamiento", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<FotografiaJpaEntity> fotografias = new ArrayList<>();

    @OneToMany(mappedBy = "idAlojamiento", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<UnidadReservableJpaEntity> unidades = new ArrayList<>();
}
