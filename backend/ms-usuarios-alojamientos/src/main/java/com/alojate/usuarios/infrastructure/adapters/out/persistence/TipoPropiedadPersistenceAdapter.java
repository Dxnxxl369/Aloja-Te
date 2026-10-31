package com.alojate.usuarios.infrastructure.adapters.out.persistence;

import com.alojate.usuarios.domain.model.TipoPropiedad;
import com.alojate.usuarios.domain.ports.out.TipoPropiedadRepositoryPort;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.entity.TipoPropiedadJpaEntity;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.repository.SpringDataTipoPropiedadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class TipoPropiedadPersistenceAdapter implements TipoPropiedadRepositoryPort {

    private final SpringDataTipoPropiedadRepository tipoPropiedadRepo;

    @Override
    public TipoPropiedad guardar(TipoPropiedad tipo) {
        TipoPropiedadJpaEntity entity = TipoPropiedadJpaEntity.builder()
                .idTipoPropiedad(tipo.getIdTipoPropiedad())
                .nombre(tipo.getNombre())
                .build();
        return toDomain(tipoPropiedadRepo.save(entity));
    }

    @Override
    public Optional<TipoPropiedad> buscarPorId(Integer idTipoPropiedad) {
        return tipoPropiedadRepo.findById(idTipoPropiedad).map(this::toDomain);
    }

    @Override
    public List<TipoPropiedad> listarTodos() {
        return tipoPropiedadRepo.findAll().stream().map(this::toDomain).collect(Collectors.toList());
    }

    private TipoPropiedad toDomain(TipoPropiedadJpaEntity entity) {
        if (entity == null) return null;
        return TipoPropiedad.builder()
                .idTipoPropiedad(entity.getIdTipoPropiedad())
                .nombre(entity.getNombre())
                .build();
    }
}
