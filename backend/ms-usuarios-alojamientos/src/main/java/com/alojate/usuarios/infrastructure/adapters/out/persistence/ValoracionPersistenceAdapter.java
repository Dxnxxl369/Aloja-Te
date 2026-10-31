package com.alojate.usuarios.infrastructure.adapters.out.persistence;

import com.alojate.usuarios.domain.model.Valoracion;
import com.alojate.usuarios.domain.ports.out.ValoracionRepositoryPort;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.entity.UsuarioJpaEntity;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.entity.ValoracionJpaEntity;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.repository.SpringDataUsuarioRepository;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.repository.SpringDataValoracionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ValoracionPersistenceAdapter implements ValoracionRepositoryPort {

    private final SpringDataValoracionRepository repository;
    private final SpringDataUsuarioRepository usuarioRepository;

    @Override
    public Valoracion guardar(Valoracion domain) {
        ValoracionJpaEntity entity = toJpa(domain);
        ValoracionJpaEntity saved = repository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Valoracion> buscarPorId(UUID id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Valoracion> listarPorAlojamiento(UUID idAlojamiento) {
        return repository.findByIdAlojamientoOrderByFechaCreacionDesc(idAlojamiento)
                .stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    public List<Valoracion> listarGeneralesHotel(UUID idAlojamiento) {
        return repository.findByIdAlojamientoAndIdUnidadIsNullOrderByFechaCreacionDesc(idAlojamiento)
                .stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    public List<Valoracion> listarPorUnidad(UUID idUnidad) {
        return repository.findByIdUnidadOrderByFechaCreacionDesc(idUnidad)
                .stream().map(this::toDomain).collect(Collectors.toList());
    }

    private ValoracionJpaEntity toJpa(Valoracion d) {
        return ValoracionJpaEntity.builder()
                .idValoracion(d.getIdValoracion())
                .idAlojamiento(d.getIdAlojamiento())
                .idUnidad(d.getIdUnidad())
                .idUsuario(d.getIdUsuario())
                .idReserva(d.getIdReserva())
                .puntuacionGeneral(d.getPuntuacionGeneral() != null ? d.getPuntuacionGeneral() : 5)
                .calificacionLimpieza(d.getCalificacionLimpieza())
                .calificacionUbicacion(d.getCalificacionUbicacion())
                .calificacionCalidadPrecio(d.getCalificacionCalidadPrecio())
                .calificacionServicio(d.getCalificacionServicio())
                .calificacionComodidad(d.getCalificacionComodidad())
                .esAnonimo(Boolean.TRUE.equals(d.getEsAnonimo()))
                .comentario(d.getComentario())
                .sentimientoNlp(d.getSentimientoNlp())
                .confianzaNlp(d.getConfianzaNlp())
                .topicoPredicho(d.getTopicoPredicho())
                .fechaCreacion(d.getFechaCreacion())
                .build();
    }

    private Valoracion toDomain(ValoracionJpaEntity e) {
        String nombreVisible = "Huésped Verificado";
        if (!Boolean.TRUE.equals(e.getEsAnonimo()) && e.getIdUsuario() != null) {
            Optional<UsuarioJpaEntity> u = usuarioRepository.findById(e.getIdUsuario());
            if (u.isPresent()) {
                String nom = u.get().getNombre() != null ? u.get().getNombre() : "";
                String ape = u.get().getApellido() != null && !u.get().getApellido().isEmpty()
                        ? u.get().getApellido().substring(0, 1) + "."
                        : "";
                nombreVisible = (nom + " " + ape).trim();
            }
        }

        return Valoracion.builder()
                .idValoracion(e.getIdValoracion())
                .idAlojamiento(e.getIdAlojamiento())
                .idUnidad(e.getIdUnidad())
                .idUsuario(e.getIdUsuario())
                .nombreUsuario(nombreVisible)
                .idReserva(e.getIdReserva())
                .puntuacionGeneral(e.getPuntuacionGeneral())
                .calificacionLimpieza(e.getCalificacionLimpieza())
                .calificacionUbicacion(e.getCalificacionUbicacion())
                .calificacionCalidadPrecio(e.getCalificacionCalidadPrecio())
                .calificacionServicio(e.getCalificacionServicio())
                .calificacionComodidad(e.getCalificacionComodidad())
                .esAnonimo(e.getEsAnonimo())
                .comentario(e.getComentario())
                .sentimientoNlp(e.getSentimientoNlp())
                .confianzaNlp(e.getConfianzaNlp())
                .topicoPredicho(e.getTopicoPredicho())
                .fechaCreacion(e.getFechaCreacion())
                .build();
    }
}
