package com.alojate.usuarios.domain.exception;

public class AlmacenamientoNoDisponibleException extends RuntimeException {
    public AlmacenamientoNoDisponibleException(String message) {
        super(message);
    }

    public AlmacenamientoNoDisponibleException(String message, Throwable cause) {
        super(message, cause);
    }
}
