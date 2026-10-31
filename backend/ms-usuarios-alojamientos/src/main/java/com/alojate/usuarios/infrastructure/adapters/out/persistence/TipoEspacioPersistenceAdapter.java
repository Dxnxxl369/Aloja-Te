package com.alojate.usuarios.infrastructure.adapters.out.persistence;

import com.alojate.usuarios.domain.model.TipoEspacio;
import com.alojate.usuarios.domain.ports.out.TipoEspacioRepositoryPort;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.entity.TipoEspacioJpaEntity;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.repository.SpringDataTipoEspacioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class TipoEspacioPersistenceAdapter implements TipoEspacioRepositoryPort {

    private final SpringDataTipoEspacioRepository tipoEspacioRepo;

    @Override
    public TipoEspacio guardar(TipoEspacio tipo) {
        TipoEspacioJpaEntity entity = TipoEspacioJpaEntity.builder()
                .idTipoEspacio(tipo.getIdTipoEspacio())
                .nombre(tipo.getNombre())
                .build();
        return toDomain(tipoEspacioRepo.save(entity));
    }

    @Override
    public Optional<TipoEspacio> buscarPorId(Integer idTipoEspacio) {
        return tipoEspacioRepo.findById(idTipoEspacio).map(this::toDomain);
    }

    @Override
    public List<TipoEspacio> listarTodos() {
        return tipoEspacioRepo.findAll().stream().map(this::toDomain).collect(Collectors.toList());
    }

    private TipoEspacio toDomain(TipoEspacioJpaEntity entity) {
        if (entity == null) return null;
        return TipoEspacio.builder()
                .idTipoEspacio(entity.getIdTipoEspacio())
                .nombre(entity.getNombre())
                .build();
    }
}
