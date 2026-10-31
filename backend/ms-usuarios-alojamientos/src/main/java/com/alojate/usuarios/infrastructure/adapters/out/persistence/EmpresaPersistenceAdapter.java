package com.alojate.usuarios.infrastructure.adapters.out.persistence;

import com.alojate.usuarios.domain.model.Empresa;
import com.alojate.usuarios.domain.ports.out.EmpresaRepositoryPort;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.entity.EmpresaJpaEntity;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.repository.SpringDataEmpresaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class EmpresaPersistenceAdapter implements EmpresaRepositoryPort {

    private final SpringDataEmpresaRepository repository;

    @Override
    public Empresa guardar(Empresa empresa) {
        EmpresaJpaEntity entity = toEntity(empresa);
        EmpresaJpaEntity guardado = repository.save(entity);
        return toDomain(guardado);
    }

    @Override
    public Optional<Empresa> buscarPorId(UUID idEmpresa) {
        return repository.findById(idEmpresa).map(this::toDomain);
    }

    @Override
    public Optional<Empresa> buscarEmpresaActiva() {
        return repository.findFirstByActivoTrue().map(this::toDomain);
    }

    @Override
    public List<Empresa> listarTodas() {
        return repository.findAll().stream().map(this::toDomain).collect(Collectors.toList());
    }

    private Empresa toDomain(EmpresaJpaEntity entity) {
        if (entity == null) return null;
        return Empresa.builder()
                .idEmpresa(entity.getIdEmpresa())
                .razonSocial(entity.getRazonSocial())
                .nombreComercial(entity.getNombreComercial())
                .nit(entity.getNit())
                .representanteLegal(entity.getRepresentanteLegal())
                .telefono(entity.getTelefono())
                .email(entity.getEmail())
                .direccion(entity.getDireccion())
                .ciudad(entity.getCiudad())
                .departamento(entity.getDepartamento())
                .pais(entity.getPais())
                .logoUrl(entity.getLogoUrl())
                .sitioWeb(entity.getSitioWeb())
                .activo(entity.getActivo())
                .build();
    }

    private EmpresaJpaEntity toEntity(Empresa domain) {
        if (domain == null) return null;
        return EmpresaJpaEntity.builder()
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
                .activo(domain.getActivo() != null ? domain.getActivo() : true)
                .build();
    }
}
