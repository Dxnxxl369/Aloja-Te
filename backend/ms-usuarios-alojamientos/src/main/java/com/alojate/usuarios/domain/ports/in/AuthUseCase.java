package com.alojate.usuarios.domain.ports.in;

public interface AuthUseCase {
    AuthResult registrar(RegistrarUsuarioCommand command);
    AuthResult autenticar(LoginCommand command);
}
