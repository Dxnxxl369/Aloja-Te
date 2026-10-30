package com.alojate.usuarios.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Permiso {
    private Integer idPermiso;
    private Integer idModulo;
    private String codigo;
    private String nombre;
    private String descripcion;
    private Boolean asignable;
}
