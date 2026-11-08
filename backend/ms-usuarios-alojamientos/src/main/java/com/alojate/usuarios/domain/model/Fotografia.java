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
public class Fotografia {
    private UUID idFotografia;
    private UUID idAlojamiento;
    /** null = galería del alojamiento; con valor = foto de esa habitación. */
    private UUID idUnidad;
    /** Solo informativo (se completa al listar para moderación); no se persiste. */
    private String nombreUnidad;
    private String url;
    private Integer orden;
}
