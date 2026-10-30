package com.alojate.usuarios.infrastructure.adapters.in.rest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActualizarAlojamientoRequest {
    private Integer idTipoPropiedad;
    private String titulo;
    private String descripcion;
    private String direccion;
    private String ciudad;
    private String departamento;
    private BigDecimal latitud;
    private BigDecimal longitud;
    private Set<Integer> serviciosIds;
}
