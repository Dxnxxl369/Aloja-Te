package com.alojate.usuarios.infrastructure.adapters.in.rest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

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
    /** Fotos de la habitación, en orden (la primera es la portada). Opcional. */
    private List<CrearFotografiaRequest> fotografias;
}
