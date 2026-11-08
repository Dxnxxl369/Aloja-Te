package com.alojate.usuarios.domain.exception;

public class ModeracionNoDisponibleException extends RuntimeException {
    public ModeracionNoDisponibleException(String message) {
        super(message);
    }

    public ModeracionNoDisponibleException(String message, Throwable cause) {
        super(message, cause);
    }
}
