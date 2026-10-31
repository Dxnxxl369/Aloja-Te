package com.alojate.usuarios.infrastructure.adapters.out.persistence;

import com.alojate.usuarios.domain.model.Permiso;
import com.alojate.usuarios.domain.model.Rol;
import com.alojate.usuarios.domain.model.Usuario;
import com.alojate.usuarios.domain.ports.out.UsuarioRepositoryPort;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.entity.RolJpaEntity;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.entity.UsuarioJpaEntity;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.repository.SpringDataRolRepository;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.repository.SpringDataUsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class UsuarioPersistenceAdapter implements UsuarioRepositoryPort {

    private final SpringDataUsuarioRepository repository;
    private final SpringDataRolRepository rolRepository;

    @Override
    public Usuario guardar(Usuario usuario) {
        UsuarioJpaEntity entity = toEntity(usuario);
        UsuarioJpaEntity guardado = repository.save(entity);
        return toDomain(guardado);
    }

    @Override
    public Optional<Usuario> buscarPorEmail(String email) {
        return repository.findByEmail(email).map(this::toDomain);
    }

    @Override
    public Optional<Usuario> buscarPorId(UUID id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    public boolean existePorEmail(String email) {
        return repository.existsByEmail(email);
    }

    @Override
    public boolean existePorCi(String ci) {
        return repository.existsByCi(ci);
    }

    @Override
    public List<Usuario> listarTodos() {
        return repository.findAll().stream().map(this::toDomain).collect(Collectors.toList());
    }

    private UsuarioJpaEntity toEntity(Usuario domain) {
        if (domain == null) return null;

        RolJpaEntity rolEntity = null;
        if (domain.getIdRol() != null) {
            rolEntity = rolRepository.findById(domain.getIdRol()).orElse(null);
        } else if (domain.getRol() != null && domain.getRol().getIdRol() != null) {
            rolEntity = rolRepository.findById(domain.getRol().getIdRol()).orElse(null);
        } else if (domain.getRol() != null && domain.getRol().getNombre() != null) {
            rolEntity = rolRepository.findByNombreIgnoreCase(domain.getRol().getNombre()).orElse(null);
        }

        // Fallback default rol if not found: CLIENTE
        if (rolEntity == null) {
            rolEntity = rolRepository.findByNombreIgnoreCase("CLIENTE")
                    .orElseGet(() -> rolRepository.save(RolJpaEntity.builder()
                            .nombre("CLIENTE")
                            .ambito("GLOBAL")
                            .esSistema(true)
                            .activo(true)
                            .build()));
        }

        return UsuarioJpaEntity.builder()
                .idUsuario(domain.getIdUsuario())
                .rol(rolEntity)
                .tipoCuenta(domain.getTipoCuenta() != null ? domain.getTipoCuenta() : "PERSONAL")
                .nombre(domain.getNombre())
                .apellido(domain.getApellido())
                .email(domain.getEmail())
                .telefono(domain.getTelefono())
                .passwordHash(domain.getPasswordHash())
                .ci(domain.getCi())
                .ciComplemento(domain.getCiComplemento())
                .ciExpedido(domain.getCiExpedido())
                .telefonoEmergencia(domain.getTelefonoEmergencia())
                .direccionDomicilio(domain.getDireccionDomicilio())
                .departamentoRadicatoria(domain.getDepartamentoRadicatoria())
                .bancoNombre(domain.getBancoNombre())
                .numeroCuentaBancaria(domain.getNumeroCuentaBancaria())
                .estado(domain.getEstado())
                .fechaRegistro(domain.getFechaRegistro())
                .fechaActualizacion(domain.getFechaActualizacion())
                .build();
    }

    private Usuario toDomain(UsuarioJpaEntity entity) {
        if (entity == null) return null;

        Rol rolDomain = null;
        if (entity.getRol() != null) {
            Set<Permiso> permisos = entity.getRol().getPermisos() != null
                    ? entity.getRol().getPermisos().stream().map(p -> Permiso.builder()
                            .idPermiso(p.getIdPermiso())
                            .idModulo(p.getIdModulo())
                            .codigo(p.getCodigo())
                            .nombre(p.getNombre())
                            .descripcion(p.getDescripcion())
                            .asignable(p.getAsignable())
                            .build()).collect(Collectors.toSet())
                    : new HashSet<>();

            rolDomain = Rol.builder()
                    .idRol(entity.getRol().getIdRol())
                    .nombre(entity.getRol().getNombre())
                    .ambito(entity.getRol().getAmbito())
                    .esSistema(entity.getRol().getEsSistema())
                    .activo(entity.getRol().getActivo())
                    .permisos(permisos)
                    .build();
        }

        return Usuario.builder()
                .idUsuario(entity.getIdUsuario())
                .idRol(entity.getRol() != null ? entity.getRol().getIdRol() : null)
                .rol(rolDomain)
                .tipoCuenta(entity.getTipoCuenta())
                .nombre(entity.getNombre())
                .apellido(entity.getApellido())
                .email(entity.getEmail())
                .telefono(entity.getTelefono())
                .passwordHash(entity.getPasswordHash())
                .ci(entity.getCi())
                .ciComplemento(entity.getCiComplemento())
                .ciExpedido(entity.getCiExpedido())
                .telefonoEmergencia(entity.getTelefonoEmergencia())
                .direccionDomicilio(entity.getDireccionDomicilio())
                .departamentoRadicatoria(entity.getDepartamentoRadicatoria())
                .bancoNombre(entity.getBancoNombre())
                .numeroCuentaBancaria(entity.getNumeroCuentaBancaria())
                .estado(entity.getEstado())
                .fechaRegistro(entity.getFechaRegistro())
                .fechaActualizacion(entity.getFechaActualizacion())
                .build();
    }
}
