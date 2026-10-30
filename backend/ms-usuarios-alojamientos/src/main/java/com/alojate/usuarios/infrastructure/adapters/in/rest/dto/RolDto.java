package com.alojate.usuarios.infrastructure.adapters.in.rest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RolDto {
    private Integer idRol;
    private String nombre;
    private String ambito;
    private Boolean esSistema;
    private Boolean activo;
    private Set<PermisoDto> permisos;
}
