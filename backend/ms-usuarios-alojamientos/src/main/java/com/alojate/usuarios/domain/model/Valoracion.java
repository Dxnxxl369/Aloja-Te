package com.alojate.usuarios.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Valoracion {
    private UUID idValoracion;
    private UUID idAlojamiento;
    private UUID idUnidad; // Nullable: NULL = Hotel en general; con valor = Habitación específica
    private UUID idUsuario;
    private String nombreUsuario; // Enmascarado a "Huésped Verificado" si esAnonimo == true
    private UUID idReserva;

    // Calificación general obligatoria en 1 click (1 a 5)
    private Integer puntuacionGeneral;

    // 5 Atributos Dimensionales (Opcionales / Nullables)
    private Integer calificacionLimpieza;
    private Integer calificacionUbicacion;
    private Integer calificacionCalidadPrecio;
    private Integer calificacionServicio;
    private Integer calificacionComodidad;

    // Privacidad y protección del huésped
    private Boolean esAnonimo;

    // Contenido de texto y análisis NLP
    private String comentario;
    private String sentimientoNlp; // POSITIVO, NEUTRO, NEGATIVO
    private BigDecimal confianzaNlp;
    private String topicoPredicho;

    private LocalDateTime fechaCreacion;
}
