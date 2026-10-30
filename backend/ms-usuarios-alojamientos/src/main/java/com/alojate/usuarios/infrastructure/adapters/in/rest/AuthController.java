package com.alojate.usuarios.infrastructure.adapters.in.rest;

import com.alojate.usuarios.domain.ports.in.AuthResult;
import com.alojate.usuarios.domain.ports.in.AuthUseCase;
import com.alojate.usuarios.domain.ports.in.LoginCommand;
import com.alojate.usuarios.domain.ports.in.RegistrarUsuarioCommand;
import com.alojate.usuarios.infrastructure.adapters.in.rest.dto.AuthResponseDto;
import com.alojate.usuarios.infrastructure.adapters.in.rest.dto.LoginRequest;
import com.alojate.usuarios.infrastructure.adapters.in.rest.dto.RegistroRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthUseCase authUseCase;

    @PostMapping({"/registro", "/register"})
    public ResponseEntity<AuthResponseDto> registrar(@Valid @RequestBody RegistroRequest request) {
        RegistrarUsuarioCommand command = RegistrarUsuarioCommand.builder()
                .email(request.getEmail())
                .password(request.getPassword())
                .nombre(request.getNombre())
                .apellido(request.getApellido())
                .ci(request.getCi())
                .ciComplemento(request.getCiComplemento())
                .ciExpedido(request.getCiExpedido())
                .telefono(request.getTelefono())
                .telefonoEmergencia(request.getTelefonoEmergencia())
                .direccionDomicilio(request.getDireccionDomicilio())
                .departamentoRadicatoria(request.getDepartamentoRadicatoria())
                .bancoNombre(request.getBancoNombre())
                .numeroCuentaBancaria(request.getNumeroCuentaBancaria())
                .rol(request.getRol())
                .tipoCuenta(request.getTipoCuenta())
                .build();

        AuthResult result = authUseCase.registrar(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponseDto(result));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody LoginRequest request) {
        LoginCommand command = LoginCommand.builder()
                .email(request.getEmail())
                .password(request.getPassword())
                .portalEsperado(request.getPortalEsperado())
                .build();

        AuthResult result = authUseCase.autenticar(command);
        return ResponseEntity.ok(toResponseDto(result));
    }

    private AuthResponseDto toResponseDto(AuthResult result) {
        return AuthResponseDto.builder()
                .token(result.getToken())
                .usuarioId(result.getUsuarioId())
                .email(result.getEmail())
                .nombreCompleto(result.getNombreCompleto())
                .rol(result.getRol())
                .estado(result.getEstado())
                .mensaje(result.getMensaje())
                .build();
    }
}
