package com.alojate.usuarios.infrastructure.adapters.in.rest;

import com.alojate.usuarios.domain.model.Empresa;
import com.alojate.usuarios.domain.ports.in.EmpresaUseCase;
import com.alojate.usuarios.infrastructure.adapters.in.rest.dto.EmpresaDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/configuracion/empresa")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EmpresaController {

    private final EmpresaUseCase empresaUseCase;

    @GetMapping("/activa")
    public ResponseEntity<EmpresaDto> obtenerEmpresaActiva() {
        Empresa empresa = empresaUseCase.obtenerEmpresaActiva();
        return ResponseEntity.ok(toDto(empresa));
    }

    @GetMapping
    public ResponseEntity<List<EmpresaDto>> listarEmpresas() {
        List<EmpresaDto> list = empresaUseCase.listarEmpresas().stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmpresaDto> obtenerPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(toDto(empresaUseCase.obtenerPorId(id)));
    }

    @PostMapping
    public ResponseEntity<EmpresaDto> registrarOActualizar(@RequestBody EmpresaDto dto) {
        Empresa domain = toDomain(dto);
        Empresa guardado = empresaUseCase.registrarOActualizarEmpresa(domain);
        return ResponseEntity.ok(toDto(guardado));
    }

    private EmpresaDto toDto(Empresa domain) {
        if (domain == null) return null;
        return EmpresaDto.builder()
                .idEmpresa(domain.getIdEmpresa())
                .razonSocial(domain.getRazonSocial())
                .nombreComercial(domain.getNombreComercial())
                .nit(domain.getNit())
                .representanteLegal(domain.getRepresentanteLegal())
                .telefono(domain.getTelefono())
                .email(domain.getEmail())
                .direccion(domain.getDireccion())
                .ciudad(domain.getCiudad())
                .departamento(domain.getDepartamento())
                .pais(domain.getPais())
                .logoUrl(domain.getLogoUrl())
                .sitioWeb(domain.getSitioWeb())
                .activo(domain.getActivo())
                .build();
    }

    private Empresa toDomain(EmpresaDto dto) {
        if (dto == null) return null;
        return Empresa.builder()
                .idEmpresa(dto.getIdEmpresa())
                .razonSocial(dto.getRazonSocial())
                .nombreComercial(dto.getNombreComercial())
                .nit(dto.getNit())
                .representanteLegal(dto.getRepresentanteLegal())
                .telefono(dto.getTelefono())
                .email(dto.getEmail())
                .direccion(dto.getDireccion())
                .ciudad(dto.getCiudad())
                .departamento(dto.getDepartamento())
                .pais(dto.getPais())
                .logoUrl(dto.getLogoUrl())
                .sitioWeb(dto.getSitioWeb())
                .activo(dto.getActivo())
                .build();
    }
}
