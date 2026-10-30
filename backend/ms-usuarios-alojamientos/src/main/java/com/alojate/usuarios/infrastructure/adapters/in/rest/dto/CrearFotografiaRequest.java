package com.alojate.usuarios.infrastructure.adapters.in.rest.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrearFotografiaRequest {
    @NotBlank(message = "La URL de la fotografía es obligatoria.")
    private String url;
    private Integer orden;
}
