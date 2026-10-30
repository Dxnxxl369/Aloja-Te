package com.alojate.usuarios.infrastructure.adapters.in.rest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermisoDto {
    private Integer idPermiso;
    private Integer idModulo;
    private String codigo;
    private String nombre;
    private String descripcion;
    private Boolean asignable;
}
