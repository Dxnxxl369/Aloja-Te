package com.alojate.usuarios.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestriccionUsuario {
    private UUID idRestriccion;
    private UUID idUsuario;
    private Integer idPermiso;
    private UUID idAdministrador;
    private String motivo;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private Boolean activa;

    public boolean estaVigente(LocalDateTime ahora) {
        if (!Boolean.TRUE.equals(this.activa)) {
            return false;
        }
        if (fechaInicio != null && ahora.isBefore(fechaInicio)) {
            return false;
        }
        if (fechaFin != null && ahora.isAfter(fechaFin)) {
            return false;
        }
        return true;
    }
}
