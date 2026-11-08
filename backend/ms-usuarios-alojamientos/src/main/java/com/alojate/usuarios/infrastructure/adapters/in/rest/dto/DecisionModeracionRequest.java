package com.alojate.usuarios.infrastructure.adapters.in.rest.dto;

import com.alojate.usuarios.domain.model.EstadoPublicacion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DecisionModeracionRequest {
    private EstadoPublicacion nuevoEstado;
    private String motivo;
    private String origen;
    /** Revisión a la que pertenece el resultado (la envía n8n); si ya no es la vigente, se descarta. */
    private UUID idRevision;
}
