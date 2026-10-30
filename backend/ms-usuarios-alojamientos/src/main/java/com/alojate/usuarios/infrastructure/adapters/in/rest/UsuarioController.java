package com.alojate.usuarios.infrastructure.adapters.in.rest;

import com.alojate.usuarios.domain.model.Usuario;
import com.alojate.usuarios.domain.ports.in.UsuarioUseCase;
import com.alojate.usuarios.infrastructure.adapters.in.rest.dto.ActualizarPerfilRequest;
import com.alojate.usuarios.infrastructure.adapters.in.rest.dto.CambiarEstadoRequest;
import com.alojate.usuarios.infrastructure.adapters.in.rest.dto.UsuarioDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/usuarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioUseCase usuarioUseCase;

    @GetMapping
    public ResponseEntity<List<UsuarioDto>> listarUsuarios() {
        return ResponseEntity.ok(usuarioUseCase.listarTodos().stream()
                .map(this::toDto)
                .collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDto> obtenerPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(toDto(usuarioUseCase.obtenerPorId(id)));
    }

    @GetMapping("/por-email")
    public ResponseEntity<UsuarioDto> obtenerPorEmail(@RequestParam String email) {
        return ResponseEntity.ok(toDto(usuarioUseCase.obtenerPorEmail(email)));
    }

    @PutMapping("/{id}/perfil")
    public ResponseEntity<UsuarioDto> actualizarPerfil(@PathVariable UUID id, @RequestBody ActualizarPerfilRequest request) {
        Usuario usuario = usuarioUseCase.actualizarPerfil(id, request.getNombre(), request.getApellido(), request.getTelefono());
        return ResponseEntity.ok(toDto(usuario));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<UsuarioDto> cambiarEstado(@PathVariable UUID id, @RequestBody CambiarEstadoRequest request) {
        Usuario usuario = usuarioUseCase.cambiarEstado(id, request.getNuevoEstado());
        return ResponseEntity.ok(toDto(usuario));
    }

    private UsuarioDto toDto(Usuario domain) {
        if (domain == null) return null;
        String rolNombre = domain.getRol() != null ? domain.getRol().getNombre() : "CLIENTE";
        return UsuarioDto.builder()
                .idUsuario(domain.getIdUsuario())
                .idRol(domain.getIdRol())
                .rolNombre(rolNombre)
                .tipoCuenta(domain.getTipoCuenta())
                .nombre(domain.getNombre())
                .apellido(domain.getApellido())
                .email(domain.getEmail())
                .telefono(domain.getTelefono())
                .ci(domain.getCi())
                .ciExpedido(domain.getCiExpedido())
                .estado(domain.getEstado())
                .fechaRegistro(domain.getFechaRegistro())
                .build();
    }
}
