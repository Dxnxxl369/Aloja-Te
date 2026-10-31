package com.alojate.usuarios.infrastructure.adapters.out.security;

import com.alojate.usuarios.domain.ports.out.PasswordEncoderPort;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class BCryptPasswordEncoderAdapter implements PasswordEncoderPort {

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    @Override
    public String codificar(String rawPassword) {
        return encoder.encode(rawPassword);
    }

    @Override
    public boolean coincide(String rawPassword, String encodedPassword) {
        return encoder.matches(rawPassword, encodedPassword);
    }
}
