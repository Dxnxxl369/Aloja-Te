package com.alojate.usuarios.infrastructure.adapters.in.rest.dto;

import com.alojate.usuarios.domain.model.EstadoPublicacion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DecisionModeracionRequest {
    private EstadoPublicacion nuevoEstado;
    private String motivo;
    private String origen;
}
