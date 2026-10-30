package com.alojate.usuarios.infrastructure.adapters.in.rest;

import com.alojate.usuarios.domain.model.Modulo;
import com.alojate.usuarios.domain.model.Permiso;
import com.alojate.usuarios.domain.model.RestriccionUsuario;
import com.alojate.usuarios.domain.model.Rol;
import com.alojate.usuarios.domain.ports.in.SeguridadUseCase;
import com.alojate.usuarios.infrastructure.adapters.in.rest.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/seguridad")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SeguridadController {

    private final SeguridadUseCase seguridadUseCase;

    // --- MODULOS ---
    @GetMapping("/modulos")
    public ResponseEntity<List<ModuloDto>> listarModulos() {
        return ResponseEntity.ok(seguridadUseCase.listarModulos().stream()
                .map(this::toDto)
                .collect(Collectors.toList()));
    }

    @PostMapping("/modulos")
    public ResponseEntity<ModuloDto> crearModulo(@RequestBody ModuloDto dto) {
        Modulo modulo = Modulo.builder()
                .nombre(dto.getNombre())
                .descripcion(dto.getDescripcion())
                .orden(dto.getOrden() != null ? dto.getOrden() : 0)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(seguridadUseCase.crearModulo(modulo)));
    }

    // --- PERMISOS ---
    @GetMapping("/permisos")
    public ResponseEntity<List<PermisoDto>> listarPermisos(@RequestParam(required = false) Integer moduloId) {
        List<Permiso> list = (moduloId != null)
                ? seguridadUseCase.listarPermisosPorModulo(moduloId)
                : seguridadUseCase.listarPermisos();
        return ResponseEntity.ok(list.stream().map(this::toDto).collect(Collectors.toList()));
    }

    @PostMapping("/permisos")
    public ResponseEntity<PermisoDto> crearPermiso(@RequestBody PermisoDto dto) {
        Permiso permiso = Permiso.builder()
                .idModulo(dto.getIdModulo())
                .codigo(dto.getCodigo())
                .nombre(dto.getNombre())
                .descripcion(dto.getDescripcion())
                .asignable(dto.getAsignable() != null ? dto.getAsignable() : true)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(seguridadUseCase.crearPermiso(permiso)));
    }

    // --- ROLES ---
    @GetMapping("/roles")
    public ResponseEntity<List<RolDto>> listarRoles() {
        return ResponseEntity.ok(seguridadUseCase.listarRoles().stream()
                .map(this::toDto)
                .collect(Collectors.toList()));
    }

    @GetMapping("/roles/{id}")
    public ResponseEntity<RolDto> obtenerRol(@PathVariable Integer id) {
        return ResponseEntity.ok(toDto(seguridadUseCase.obtenerRol(id)));
    }

    @PostMapping("/roles")
    public ResponseEntity<RolDto> crearRol(@RequestBody RolDto dto) {
        Rol rol = Rol.builder()
                .nombre(dto.getNombre())
                .ambito(dto.getAmbito() != null ? dto.getAmbito() : "GLOBAL")
                .esSistema(dto.getEsSistema() != null ? dto.getEsSistema() : false)
                .activo(dto.getActivo() != null ? dto.getActivo() : true)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(seguridadUseCase.crearRol(rol)));
    }

    @PutMapping("/roles/{id}/permisos")
    public ResponseEntity<RolDto> asignarPermisosARol(@PathVariable Integer id, @RequestBody AsignarPermisosRequest request) {
        Rol actualizado = seguridadUseCase.asignarPermisosARol(id, request.getIdsPermisos());
        return ResponseEntity.ok(toDto(actualizado));
    }

    // --- RESTRICCIONES DE USUARIO ---
    @PostMapping("/usuarios/{idUsuario}/restricciones")
    public ResponseEntity<RestriccionUsuarioDto> aplicarRestriccion(
            @PathVariable UUID idUsuario,
            @RequestBody AplicarRestriccionRequest request) {
        RestriccionUsuario restriccion = seguridadUseCase.aplicarRestriccion(
                idUsuario,
                request.getIdPermiso(),
                request.getIdAdministrador(),
                request.getMotivo(),
                request.getFechaInicio(),
                request.getFechaFin()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(restriccion));
    }

    @GetMapping("/usuarios/{idUsuario}/restricciones")
    public ResponseEntity<List<RestriccionUsuarioDto>> listarRestricciones(@PathVariable UUID idUsuario) {
        return ResponseEntity.ok(seguridadUseCase.listarRestriccionesDeUsuario(idUsuario).stream()
                .map(this::toDto)
                .collect(Collectors.toList()));
    }

    @DeleteMapping("/restricciones/{idRestriccion}")
    public ResponseEntity<Void> desactivarRestriccion(@PathVariable UUID idRestriccion) {
        seguridadUseCase.desactivarRestriccion(idRestriccion);
        return ResponseEntity.noContent().build();
    }

    // --- MAPPERS ---
    private ModuloDto toDto(Modulo domain) {
        if (domain == null) return null;
        return ModuloDto.builder()
                .idModulo(domain.getIdModulo())
                .nombre(domain.getNombre())
                .descripcion(domain.getDescripcion())
                .orden(domain.getOrden())
                .build();
    }

    private PermisoDto toDto(Permiso domain) {
        if (domain == null) return null;
        return PermisoDto.builder()
                .idPermiso(domain.getIdPermiso())
                .idModulo(domain.getIdModulo())
                .codigo(domain.getCodigo())
                .nombre(domain.getNombre())
                .descripcion(domain.getDescripcion())
                .asignable(domain.getAsignable())
                .build();
    }

    private RolDto toDto(Rol domain) {
        if (domain == null) return null;
        Set<PermisoDto> permisosDto = domain.getPermisos() != null
                ? domain.getPermisos().stream().map(this::toDto).collect(Collectors.toSet())
                : Set.of();

        return RolDto.builder()
                .idRol(domain.getIdRol())
                .nombre(domain.getNombre())
                .ambito(domain.getAmbito())
                .esSistema(domain.getEsSistema())
                .activo(domain.getActivo())
                .permisos(permisosDto)
                .build();
    }

    private RestriccionUsuarioDto toDto(RestriccionUsuario domain) {
        if (domain == null) return null;
        return RestriccionUsuarioDto.builder()
                .idRestriccion(domain.getIdRestriccion())
                .idUsuario(domain.getIdUsuario())
                .idPermiso(domain.getIdPermiso())
                .idAdministrador(domain.getIdAdministrador())
                .motivo(domain.getMotivo())
                .fechaInicio(domain.getFechaInicio())
                .fechaFin(domain.getFechaFin())
                .activa(domain.getActiva())
                .build();
    }
}
