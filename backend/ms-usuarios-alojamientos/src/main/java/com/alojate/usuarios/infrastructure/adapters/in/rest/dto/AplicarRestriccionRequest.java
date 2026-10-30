package com.alojate.usuarios.infrastructure.adapters.in.rest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AplicarRestriccionRequest {
    private Integer idPermiso;
    private UUID idAdministrador;
    private String motivo;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
}
