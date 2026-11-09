package com.alojate.usuarios.infrastructure.adapters.in.rest.exception;

import com.alojate.usuarios.domain.exception.AccesoDenegadoException;
import com.alojate.usuarios.domain.exception.AlmacenamientoNoDisponibleException;
import com.alojate.usuarios.domain.exception.CredencialesInvalidasException;
import com.alojate.usuarios.domain.exception.ImagenInvalidaException;
import com.alojate.usuarios.domain.exception.ModeracionNoDisponibleException;
import com.alojate.usuarios.domain.exception.TransicionEstadoInvalidaException;
import com.alojate.usuarios.domain.exception.UsuarioYaExisteException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UsuarioYaExisteException.class)
    public ResponseEntity<Map<String, Object>> handleUsuarioYaExiste(UsuarioYaExisteException ex) {
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(CredencialesInvalidasException.class)
    public ResponseEntity<Map<String, Object>> handleCredencialesInvalidas(CredencialesInvalidasException ex) {
        return buildResponse(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    @ExceptionHandler(AccesoDenegadoException.class)
    public ResponseEntity<Map<String, Object>> handleAccesoDenegado(AccesoDenegadoException ex) {
        return buildResponse(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    @ExceptionHandler(TransicionEstadoInvalidaException.class)
    public ResponseEntity<Map<String, Object>> handleTransicionInvalida(TransicionEstadoInvalidaException ex) {
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(ModeracionNoDisponibleException.class)
    public ResponseEntity<Map<String, Object>> handleModeracionNoDisponible(ModeracionNoDisponibleException ex) {
        return buildResponse(HttpStatus.SERVICE_UNAVAILABLE, ex.getMessage());
    }

    @ExceptionHandler(ImagenInvalidaException.class)
    public ResponseEntity<Map<String, Object>> handleImagenInvalida(ImagenInvalidaException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(AlmacenamientoNoDisponibleException.class)
    public ResponseEntity<Map<String, Object>> handleAlmacenamientoNoDisponible(AlmacenamientoNoDisponibleException ex) {
        return buildResponse(HttpStatus.SERVICE_UNAVAILABLE, ex.getMessage());
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> handleArchivoGrande(MaxUploadSizeExceededException ex) {
        return buildResponse(HttpStatus.PAYLOAD_TOO_LARGE, "La imagen supera el tamaño máximo permitido (10 MB).");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Validación Fallida");
        body.put("detalles", errors);
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno del servidor: " + ex.getMessage());
    }

    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("mensaje", message);
        return ResponseEntity.status(status).body(body);
    }
}
