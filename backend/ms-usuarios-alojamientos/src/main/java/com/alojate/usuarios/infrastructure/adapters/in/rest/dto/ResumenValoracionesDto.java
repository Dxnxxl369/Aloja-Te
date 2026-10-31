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
public class ResumenValoracionesDto {
    private BigDecimal calificacionPromedio;
    private Integer totalResenas;
    private BigDecimal promedioLimpieza;
    private BigDecimal promedioUbicacion;
    private BigDecimal promedioCalidadPrecio;
    private BigDecimal promedioServicio;
    private BigDecimal promedioComodidad;
    private Integer conteoPositivos;
    private Integer conteoNeutros;
    private Integer conteoNegativos;
}
