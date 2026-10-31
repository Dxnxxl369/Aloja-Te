package com.alojate.usuarios.infrastructure.adapters.out.persistence;

import com.alojate.usuarios.domain.model.TipoEspacio;
import com.alojate.usuarios.domain.model.UnidadReservable;
import com.alojate.usuarios.domain.ports.out.UnidadReservableRepositoryPort;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.entity.TipoEspacioJpaEntity;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.entity.UnidadReservableJpaEntity;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.repository.SpringDataTipoEspacioRepository;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.repository.SpringDataUnidadReservableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class UnidadReservablePersistenceAdapter implements UnidadReservableRepositoryPort {

    private final SpringDataUnidadReservableRepository repository;
    private final SpringDataTipoEspacioRepository tipoEspacioRepository;

    @Override
    public UnidadReservable guardar(UnidadReservable unidad) {
        UnidadReservableJpaEntity entity = toEntity(unidad);
        UnidadReservableJpaEntity guardado = repository.save(entity);
        return toDomain(guardado);
    }

    @Override
    public Optional<UnidadReservable> buscarPorId(UUID idUnidad) {
        return repository.findById(idUnidad).map(this::toDomain);
    }

    @Override
    public List<UnidadReservable> listarPorAlojamiento(UUID idAlojamiento) {
        return repository.findByIdAlojamiento(idAlojamiento).stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    public void eliminarPorId(UUID idUnidad) {
        repository.deleteById(idUnidad);
    }

    private UnidadReservable toDomain(UnidadReservableJpaEntity entity) {
        if (entity == null) return null;
        TipoEspacio tipoEspacio = null;
        if (entity.getTipoEspacio() != null) {
            tipoEspacio = TipoEspacio.builder()
                    .idTipoEspacio(entity.getTipoEspacio().getIdTipoEspacio())
                    .nombre(entity.getTipoEspacio().getNombre())
                    .build();
        }

        return UnidadReservable.builder()
                .idUnidad(entity.getIdUnidad())
                .idAlojamiento(entity.getIdAlojamiento())
                .idTipoEspacio(entity.getTipoEspacio() != null ? entity.getTipoEspacio().getIdTipoEspacio() : null)
                .tipoEspacio(tipoEspacio)
                .nombre(entity.getNombre())
                .capacidadHuespedes(entity.getCapacidadHuespedes())
                .cantidadDormitorios(entity.getCantidadDormitorios())
                .cantidadCamas(entity.getCantidadCamas())
                .cantidadBanos(entity.getCantidadBanos())
                .inventarioTotal(entity.getInventarioTotal())
                .precioNoche(entity.getPrecioNoche())
                .estado(entity.getEstado())
                .build();
    }

    private UnidadReservableJpaEntity toEntity(UnidadReservable domain) {
        if (domain == null) return null;

        TipoEspacioJpaEntity tipoEspacioEntity = null;
        if (domain.getIdTipoEspacio() != null) {
            tipoEspacioEntity = tipoEspacioRepository.findById(domain.getIdTipoEspacio()).orElse(null);
        }

        if (tipoEspacioEntity == null) {
            tipoEspacioEntity = tipoEspacioRepository.findByNombreIgnoreCase("Lugar entero")
                    .orElseGet(() -> tipoEspacioRepository.save(TipoEspacioJpaEntity.builder().nombre("Lugar entero").build()));
        }

        return UnidadReservableJpaEntity.builder()
                .idUnidad(domain.getIdUnidad())
                .idAlojamiento(domain.getIdAlojamiento())
                .tipoEspacio(tipoEspacioEntity)
                .nombre(domain.getNombre())
                .capacidadHuespedes(domain.getCapacidadHuespedes())
                .cantidadDormitorios(domain.getCantidadDormitorios())
                .cantidadCamas(domain.getCantidadCamas())
                .cantidadBanos(domain.getCantidadBanos())
                .inventarioTotal(domain.getInventarioTotal())
                .precioNoche(domain.getPrecioNoche())
                .estado(domain.getEstado())
                .build();
    }
}
