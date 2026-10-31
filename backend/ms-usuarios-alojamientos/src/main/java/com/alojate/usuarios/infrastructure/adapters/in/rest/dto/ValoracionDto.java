package com.alojate.usuarios.infrastructure.adapters.in.rest.dto;

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
public class ValoracionDto {
    private UUID idValoracion;
    private UUID idAlojamiento;
    private UUID idUnidad;
    private UUID idUsuario;
    private String nombreUsuario;
    private UUID idReserva;
    private Integer puntuacionGeneral;
    private Integer calificacionLimpieza;
    private Integer calificacionUbicacion;
    private Integer calificacionCalidadPrecio;
    private Integer calificacionServicio;
    private Integer calificacionComodidad;
    private Boolean esAnonimo;
    private String comentario;
    private String sentimientoNlp;
    private BigDecimal confianzaNlp;
    private String topicoPredicho;
    private LocalDateTime fechaCreacion;
}
