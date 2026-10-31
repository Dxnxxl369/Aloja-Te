package com.alojate.usuarios.infrastructure.adapters.in.rest.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrearValoracionRequest {

    private UUID idUnidad; // Opcional (si es null, es reseña general del Hotel)

    @NotNull(message = "El idUsuario es obligatorio")
    private UUID idUsuario;

    private UUID idReserva; // Opcional para trazabilidad

    @NotNull(message = "La puntuación general es obligatoria")
    @Min(value = 1, message = "La puntuación mínima es 1")
    @Max(value = 5, message = "La puntuación máxima es 5")
    private Integer puntuacionGeneral;

    // 5 Atributos opcionales (Nullable)
    @Min(1) @Max(5)
    private Integer calificacionLimpieza;

    @Min(1) @Max(5)
    private Integer calificacionUbicacion;

    @Min(1) @Max(5)
    private Integer calificacionCalidadPrecio;

    @Min(1) @Max(5)
    private Integer calificacionServicio;

    @Min(1) @Max(5)
    private Integer calificacionComodidad;

    private Boolean esAnonimo;

    @NotBlank(message = "El comentario no puede estar vacío")
    private String comentario;

    // Campos procesados opcionales si vienen desde frontend o pipeline NLP
    private String sentimientoNlp;
    private BigDecimal confianzaNlp;
    private String topicoPredicho;
}
