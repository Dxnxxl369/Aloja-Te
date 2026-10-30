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
public class FotografiaDto {
    private UUID idFotografia;
    private UUID idAlojamiento;
    private String url;
    private Integer orden;
}
