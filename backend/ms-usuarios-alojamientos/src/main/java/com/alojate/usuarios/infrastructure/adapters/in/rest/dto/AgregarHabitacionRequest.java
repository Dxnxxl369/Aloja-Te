package com.alojate.usuarios.infrastructure.adapters.in.rest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgregarHabitacionRequest {
    private String nombre;
    private BigDecimal precioNoche;
    private Integer inventarioTotal;
    private Integer capacidadHuespedes;
    private Integer cantidadDormitorios;
    private Integer cantidadCamas;
    private BigDecimal cantidadBanos;
    private Integer idTipoEspacio;
}
