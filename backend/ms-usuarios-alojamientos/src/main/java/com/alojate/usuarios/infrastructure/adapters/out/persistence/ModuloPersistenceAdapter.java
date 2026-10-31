package com.alojate.usuarios.infrastructure.adapters.out.persistence;

import com.alojate.usuarios.domain.model.Modulo;
import com.alojate.usuarios.domain.ports.out.ModuloRepositoryPort;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.entity.ModuloJpaEntity;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.repository.SpringDataModuloRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ModuloPersistenceAdapter implements ModuloRepositoryPort {

    private final SpringDataModuloRepository moduloRepo;

    @Override
    public Modulo guardar(Modulo modulo) {
        ModuloJpaEntity entity = ModuloJpaEntity.builder()
                .idModulo(modulo.getIdModulo())
                .nombre(modulo.getNombre())
                .descripcion(modulo.getDescripcion())
                .orden(modulo.getOrden())
                .build();
        return toDomain(moduloRepo.save(entity));
    }

    @Override
    public Optional<Modulo> buscarPorId(Integer idModulo) {
        return moduloRepo.findById(idModulo).map(this::toDomain);
    }

    @Override
    public List<Modulo> listarTodos() {
        return moduloRepo.findAllByOrderByOrdenAsc().stream().map(this::toDomain).collect(Collectors.toList());
    }

    private Modulo toDomain(ModuloJpaEntity entity) {
        if (entity == null) return null;
        return Modulo.builder()
                .idModulo(entity.getIdModulo())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .orden(entity.getOrden())
                .build();
    }
}
