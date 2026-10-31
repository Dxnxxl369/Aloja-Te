package com.alojate.usuarios.domain.ports.out;

public interface PasswordEncoderPort {
    String codificar(String rawPassword);
    boolean coincide(String rawPassword, String encodedPassword);
}
