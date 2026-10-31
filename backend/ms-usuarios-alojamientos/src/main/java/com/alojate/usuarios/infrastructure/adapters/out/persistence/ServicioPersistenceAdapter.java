package com.alojate.usuarios.infrastructure.adapters.out.persistence;

import com.alojate.usuarios.domain.model.Servicio;
import com.alojate.usuarios.domain.ports.out.ServicioRepositoryPort;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.entity.ServicioJpaEntity;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.repository.SpringDataServicioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ServicioPersistenceAdapter implements ServicioRepositoryPort {

    private final SpringDataServicioRepository servicioRepo;

    @Override
    public Servicio guardar(Servicio servicio) {
        ServicioJpaEntity entity = ServicioJpaEntity.builder()
                .idServicio(servicio.getIdServicio())
                .nombre(servicio.getNombre())
                .categoria(servicio.getCategoria())
                .build();
        return toDomain(servicioRepo.save(entity));
    }

    @Override
    public Optional<Servicio> buscarPorId(Integer idServicio) {
        return servicioRepo.findById(idServicio).map(this::toDomain);
    }

    @Override
    public List<Servicio> listarTodos() {
        return servicioRepo.findAll().stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    public List<Servicio> listarPorCategoria(String categoria) {
        return servicioRepo.findByCategoriaIgnoreCase(categoria).stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    public Set<Servicio> buscarPorIds(Set<Integer> ids) {
        if (ids == null || ids.isEmpty()) return new HashSet<>();
        return servicioRepo.findByIdServicioIn(ids).stream().map(this::toDomain).collect(Collectors.toSet());
    }

    private Servicio toDomain(ServicioJpaEntity entity) {
        if (entity == null) return null;
        return Servicio.builder()
                .idServicio(entity.getIdServicio())
                .nombre(entity.getNombre())
                .categoria(entity.getCategoria())
                .build();
    }
}
