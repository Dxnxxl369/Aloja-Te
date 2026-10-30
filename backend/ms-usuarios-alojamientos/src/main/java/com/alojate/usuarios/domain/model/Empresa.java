package com.alojate.usuarios.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Empresa {
    private UUID idEmpresa;
    private String razonSocial;
    private String nombreComercial;
    private String nit;
    private String representanteLegal;
    private String telefono;
    private String email;
    private String direccion;
    private String ciudad;
    private String departamento;
    private String pais;
    private String logoUrl;
    private String sitioWeb;
    private Boolean activo;
}
