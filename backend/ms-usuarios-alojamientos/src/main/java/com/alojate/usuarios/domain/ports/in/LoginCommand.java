package com.alojate.usuarios.domain.ports.in;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginCommand {
    private String email;
    private String password;
    private String portalEsperado; // Opcional: "ADMINISTRADOR", "ANFITRION", "CLIENTE"
}
