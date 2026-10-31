package com.alojate.usuarios.domain.ports.out;

import com.alojate.usuarios.domain.model.Usuario;

public interface TokenServicePort {
    String generarToken(Usuario usuario);
    boolean validarToken(String token);
    String extraerEmail(String token);
    String extraerRol(String token);
}
