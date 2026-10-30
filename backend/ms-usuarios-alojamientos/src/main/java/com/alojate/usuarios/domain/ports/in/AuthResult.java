package com.alojate.usuarios.domain.ports.in;

import com.alojate.usuarios.domain.model.EstadoUsuario;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class AuthResult {
    private String token;
    private UUID usuarioId;
    private String email;
    private String nombreCompleto;
    private String rol;
    private EstadoUsuario estado;
    private String mensaje;
}
