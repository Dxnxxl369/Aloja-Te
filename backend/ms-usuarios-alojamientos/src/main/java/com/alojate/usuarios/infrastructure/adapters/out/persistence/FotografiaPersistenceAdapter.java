package com.alojate.usuarios.infrastructure.adapters.out.persistence;

import com.alojate.usuarios.domain.model.Fotografia;
import com.alojate.usuarios.domain.ports.out.FotografiaRepositoryPort;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.entity.FotografiaJpaEntity;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.repository.SpringDataFotografiaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class FotografiaPersistenceAdapter implements FotografiaRepositoryPort {

    private final SpringDataFotografiaRepository repository;

    @Override
    public Fotografia guardar(Fotografia fotografia) {
        FotografiaJpaEntity entity = FotografiaJpaEntity.builder()
                .idFotografia(fotografia.getIdFotografia())
                .idAlojamiento(fotografia.getIdAlojamiento())
                .idUnidad(fotografia.getIdUnidad())
                .url(fotografia.getUrl())
                .orden(fotografia.getOrden())
                .build();
        return toDomain(repository.save(entity));
    }

    @Override
    public Optional<Fotografia> buscarPorId(UUID idFotografia) {
        return repository.findById(idFotografia).map(this::toDomain);
    }

    @Override
    public List<Fotografia> listarPorAlojamiento(UUID idAlojamiento) {
        return repository.findByIdAlojamientoOrderByOrdenAsc(idAlojamiento).stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    public List<Fotografia> listarPorUnidad(UUID idUnidad) {
        return repository.findByIdUnidadOrderByOrdenAsc(idUnidad).stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    public void eliminarPorId(UUID idFotografia) {
        repository.deleteById(idFotografia);
    }

    @Override
    public void eliminarPorUnidad(UUID idUnidad) {
        repository.deleteByIdUnidad(idUnidad);
    }

    private Fotografia toDomain(FotografiaJpaEntity entity) {
        if (entity == null) return null;
        return Fotografia.builder()
                .idFotografia(entity.getIdFotografia())
                .idAlojamiento(entity.getIdAlojamiento())
                .idUnidad(entity.getIdUnidad())
                .url(entity.getUrl())
                .orden(entity.getOrden())
                .build();
    }
}
