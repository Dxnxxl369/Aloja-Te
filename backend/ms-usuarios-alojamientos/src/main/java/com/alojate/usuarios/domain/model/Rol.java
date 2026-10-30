package com.alojate.usuarios.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Rol {
    private Integer idRol;
    private String nombre;
    private String ambito;
    private Boolean esSistema;
    private Boolean activo;
    @Builder.Default
    private Set<Permiso> permisos = new HashSet<>();

    public boolean esAdministrador() {
        return "ADMINISTRADOR".equalsIgnoreCase(this.nombre);
    }

    public boolean esAnfitrion() {
        return "ANFITRION".equalsIgnoreCase(this.nombre);
    }

    public boolean esCliente() {
        return "CLIENTE".equalsIgnoreCase(this.nombre);
    }
}
