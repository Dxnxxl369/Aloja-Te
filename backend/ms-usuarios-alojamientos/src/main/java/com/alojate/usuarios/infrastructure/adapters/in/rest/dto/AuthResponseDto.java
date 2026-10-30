package com.alojate.usuarios.infrastructure.adapters.in.rest.dto;

import com.alojate.usuarios.domain.model.EstadoUsuario;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDto {
    private String token;
    private UUID usuarioId;
    private String email;
    private String nombreCompleto;
    private String rol;
    private EstadoUsuario estado;
    private String mensaje;

    @JsonProperty("usuario")
    public UsuarioInfoDto getUsuario() {
        String n = nombreCompleto != null ? nombreCompleto : "";
        String[] parts = n.split(" ", 2);
        String primerNombre = parts.length > 0 ? parts[0] : "";
        String apellidos = parts.length > 1 ? parts[1] : "";
        return new UsuarioInfoDto(
                usuarioId != null ? usuarioId.toString() : "",
                email,
                primerNombre,
                apellidos,
                rol,
                estado != null ? estado.name() : "ACTIVO"
        );
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UsuarioInfoDto {
        private String id;
        private String email;
        private String nombre;
        private String apellido;
        private String rol;
        private String tipoCuenta;
    }
}
