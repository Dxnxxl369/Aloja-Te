package com.alojate.usuarios.infrastructure.adapters.in.rest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmpresaDto {
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
