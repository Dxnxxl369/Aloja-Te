package com.alojate.usuarios.infrastructure.adapters.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "valoraciones", indexes = {
        @Index(name = "idx_val_alojamiento", columnList = "id_alojamiento"),
        @Index(name = "idx_val_unidad", columnList = "id_unidad"),
        @Index(name = "idx_val_usuario", columnList = "id_usuario"),
        @Index(name = "idx_val_fecha", columnList = "fecha_creacion")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValoracionJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_valoracion", updatable = false, nullable = false)
    private UUID idValoracion;

    @Column(name = "id_alojamiento", nullable = false)
    private UUID idAlojamiento;

    @Column(name = "id_unidad")
    private UUID idUnidad; // Nullable: si es null, aplica al hotel en general

    @Column(name = "id_usuario", nullable = false)
    private UUID idUsuario;

    @Column(name = "id_reserva")
    private UUID idReserva;

    // Calificación general obligatoria (1 a 5)
    @Column(name = "puntuacion_general", nullable = false)
    private Integer puntuacionGeneral;

    // 5 Atributos Dimensionales (Opcionales / Nullables)
    @Column(name = "calificacion_limpieza")
    private Integer calificacionLimpieza;

    @Column(name = "calificacion_ubicacion")
    private Integer calificacionUbicacion;

    @Column(name = "calificacion_calidad_precio")
    private Integer calificacionCalidadPrecio;

    @Column(name = "calificacion_servicio")
    private Integer calificacionServicio;

    @Column(name = "calificacion_comodidad")
    private Integer calificacionComodidad;

    // Privacidad
    @Column(name = "es_anonimo", nullable = false)
    @Builder.Default
    private Boolean esAnonimo = false;

    // Texto de la reseña
    @Column(columnDefinition = "TEXT", nullable = false)
    private String comentario;

    // Campos procesados por modelo NLP (Tópicos)
    @Column(name = "sentimiento_nlp", length = 30)
    private String sentimientoNlp;

    @Column(name = "confianza_nlp", precision = 6, scale = 4)
    private BigDecimal confianzaNlp;

    @Column(name = "topico_predicho", length = 60)
    private String topicoPredicho;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist
    public void prePersist() {
        if (this.fechaCreacion == null) {
            this.fechaCreacion = LocalDateTime.now();
        }
        if (this.esAnonimo == null) {
            this.esAnonimo = false;
        }
    }
}
