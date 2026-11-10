package com.alojate.usuarios.infrastructure.adapters.out.persistence;

import com.alojate.usuarios.domain.model.*;
import com.alojate.usuarios.domain.ports.out.AlojamientoRepositoryPort;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.entity.*;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.repository.SpringDataAlojamientoRepository;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.repository.SpringDataServicioRepository;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.repository.SpringDataTipoPropiedadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class AlojamientoPersistenceAdapter implements AlojamientoRepositoryPort {

    private final SpringDataAlojamientoRepository repository;
    private final SpringDataTipoPropiedadRepository tipoPropiedadRepo;
    private final SpringDataServicioRepository servicioRepo;

    @Override
    public Alojamiento guardar(Alojamiento alojamiento) {
        if (alojamiento.getIdAlojamiento() != null) {
            Optional<AlojamientoJpaEntity> existingOpt = repository.findById(alojamiento.getIdAlojamiento());
            if (existingOpt.isPresent()) {
                AlojamientoJpaEntity existing = existingOpt.get();
                existing.setTitulo(alojamiento.getTitulo());
                existing.setDescripcion(alojamiento.getDescripcion());
                existing.setDireccion(alojamiento.getDireccion());
                existing.setCiudad(alojamiento.getCiudad());
                existing.setDepartamento(alojamiento.getDepartamento());
                existing.setLatitud(alojamiento.getLatitud());
                existing.setLongitud(alojamiento.getLongitud());
                if (alojamiento.getModalidad() != null) {
                    existing.setModalidad(alojamiento.getModalidad());
                }
                existing.setPoliticas(alojamiento.getPoliticas());
                existing.setHorarioEntrada(alojamiento.getHorarioEntrada());
                existing.setHorarioSalida(alojamiento.getHorarioSalida());
                existing.setMotivoRechazo(alojamiento.getMotivoRechazo());
                existing.setMotivoObservacionRechazo(alojamiento.getMotivoObservacionRechazo() != null ? alojamiento.getMotivoObservacionRechazo() : alojamiento.getMotivoRechazo());
                existing.setOrigenUltimoCambio(alojamiento.getOrigenUltimoCambio());
                existing.setEstadoPublicacion(alojamiento.getEstadoPublicacion());
                existing.setIntentosRevision(alojamiento.getIntentosRevision());
                existing.setFechaUltimoCambioEstado(alojamiento.getFechaUltimoCambioEstado());
                existing.setHuellaFotos(alojamiento.getHuellaFotos());
                existing.setIdRevision(alojamiento.getIdRevision());
                AlojamientoJpaEntity guardado = repository.save(existing);
                return toDomain(guardado);
            }
        }
        AlojamientoJpaEntity entity = toEntity(alojamiento);
        AlojamientoJpaEntity guardado = repository.save(entity);
        return toDomain(guardado);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Alojamiento> buscarPorId(UUID idAlojamiento) {
        return repository.findById(idAlojamiento).map(this::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Alojamiento> listarTodos() {
        return repository.findAll().stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Alojamiento> listarPorAnfitrion(UUID idAnfitrion) {
        return repository.findByIdAnfitrion(idAnfitrion).stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Alojamiento> listarPorEstado(EstadoPublicacion estado) {
        return repository.findByEstadoPublicacion(estado).stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long contarPorEstado(EstadoPublicacion estado) {
        return repository.countByEstadoPublicacion(estado);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Alojamiento> buscarAvanzada(String ciudad, String departamento, Integer idTipoPropiedad, BigDecimal precioMax, Integer minHuespedes) {
        return repository.buscarAvanzada(ciudad, departamento, idTipoPropiedad, precioMax, minHuespedes)
                .stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void sincronizarServicios(UUID idAlojamiento, Set<Integer> idsServicios) {
        repository.findById(idAlojamiento).ifPresent(entity -> {
            Set<ServicioJpaEntity> servicios = new HashSet<>(servicioRepo.findAllById(idsServicios));
            entity.setServicios(servicios);
            repository.save(entity);
        });
    }

    private AlojamientoJpaEntity toEntity(Alojamiento domain) {
        if (domain == null) return null;

        TipoPropiedadJpaEntity tipoPropiedad = null;
        if (domain.getIdTipoPropiedad() != null) {
            tipoPropiedad = tipoPropiedadRepo.findById(domain.getIdTipoPropiedad()).orElse(null);
        }

        if (tipoPropiedad == null) {
            tipoPropiedad = tipoPropiedadRepo.findByNombreIgnoreCase("Departamento")
                    .orElseGet(() -> tipoPropiedadRepo.save(TipoPropiedadJpaEntity.builder().nombre("Departamento").build()));
        }

        return AlojamientoJpaEntity.builder()
                .idAlojamiento(domain.getIdAlojamiento())
                .idAnfitrion(domain.getIdAnfitrion())
                .tipoPropiedad(tipoPropiedad)
                .titulo(domain.getTitulo())
                .descripcion(domain.getDescripcion())
                .direccion(domain.getDireccion())
                .ciudad(domain.getCiudad())
                .departamento(domain.getDepartamento())
                .latitud(domain.getLatitud())
                .longitud(domain.getLongitud())
                .modalidad(domain.getModalidad() != null ? domain.getModalidad() : "CASA_DEPARTAMENTO")
                .politicas(domain.getPoliticas())
                .horarioEntrada(domain.getHorarioEntrada())
                .horarioSalida(domain.getHorarioSalida())
                .motivoRechazo(domain.getMotivoRechazo())
                .motivoObservacionRechazo(domain.getMotivoObservacionRechazo() != null ? domain.getMotivoObservacionRechazo() : domain.getMotivoRechazo())
                .origenUltimoCambio(domain.getOrigenUltimoCambio())
                .estadoPublicacion(domain.getEstadoPublicacion() != null ? domain.getEstadoPublicacion() : EstadoPublicacion.PENDIENTE)
                .fechaCreacion(domain.getFechaCreacion() != null ? domain.getFechaCreacion() : java.time.LocalDateTime.now())
                .intentosRevision(domain.getIntentosRevision())
                .fechaUltimoCambioEstado(domain.getFechaUltimoCambioEstado())
                .huellaFotos(domain.getHuellaFotos())
                .idRevision(domain.getIdRevision())
                .build();
    }

    private Alojamiento toDomain(AlojamientoJpaEntity entity) {
        if (entity == null) return null;

        TipoPropiedad tipoPropiedad = null;
        if (entity.getTipoPropiedad() != null) {
            tipoPropiedad = TipoPropiedad.builder()
                    .idTipoPropiedad(entity.getTipoPropiedad().getIdTipoPropiedad())
                    .nombre(entity.getTipoPropiedad().getNombre())
                    .build();
        }

        Set<Servicio> servicios = entity.getServicios() != null
                ? entity.getServicios().stream().map(s -> Servicio.builder()
                        .idServicio(s.getIdServicio())
                        .nombre(s.getNombre())
                        .categoria(s.getCategoria())
                        .build()).collect(Collectors.toSet())
                : new HashSet<>();

        // La tabla fotografias guarda juntas las fotos de la galería (id_unidad vacío) y las de cada habitación.
        // Aquí se separan y DEDUPLICAN estrictamente para no multiplicar fotos en UI ni en moderación.
        List<FotografiaJpaEntity> todasLasFotos = entity.getFotografias() != null ? entity.getFotografias() : List.of();
        Comparator<Fotografia> porOrden = Comparator.comparing(f -> f.getOrden() != null ? f.getOrden() : 0);

        Set<String> urlsGeneralesVistas = new HashSet<>();
        List<Fotografia> fotografias = new ArrayList<>();
        for (FotografiaJpaEntity f : todasLasFotos) {
            if (f.getIdUnidad() == null && f.getUrl() != null) {
                String uNorm = f.getUrl().trim();
                if (!uNorm.isEmpty() && !urlsGeneralesVistas.contains(uNorm)) {
                    urlsGeneralesVistas.add(uNorm);
                    fotografias.add(Fotografia.builder()
                            .idFotografia(f.getIdFotografia())
                            .idAlojamiento(f.getIdAlojamiento())
                            .url(uNorm)
                            .orden(f.getOrden())
                            .build());
                }
            }
        }
        fotografias.sort(porOrden);

        Map<UUID, List<FotografiaJpaEntity>> fotosPorUnidad = todasLasFotos.stream()
                .filter(f -> f.getIdUnidad() != null)
                .collect(Collectors.groupingBy(FotografiaJpaEntity::getIdUnidad));

        List<UnidadReservable> unidades = entity.getUnidades() != null
                ? entity.getUnidades().stream().map(u -> {
                    List<FotografiaJpaEntity> fotosEnt = fotosPorUnidad.getOrDefault(u.getIdUnidad(), List.of());
                    Set<String> urlsUnidadVistas = new HashSet<>();
                    List<Fotografia> fotosUnidad = new ArrayList<>();
                    for (FotografiaJpaEntity f : fotosEnt) {
                        if (f.getUrl() != null) {
                            String uNorm = f.getUrl().trim();
                            if (!uNorm.isEmpty() && !urlsUnidadVistas.contains(uNorm)) {
                                urlsUnidadVistas.add(uNorm);
                                fotosUnidad.add(Fotografia.builder()
                                        .idFotografia(f.getIdFotografia())
                                        .idAlojamiento(f.getIdAlojamiento())
                                        .idUnidad(f.getIdUnidad())
                                        .nombreUnidad(u.getNombre())
                                        .url(uNorm)
                                        .orden(f.getOrden())
                                        .build());
                            }
                        }
                    }
                    fotosUnidad.sort(porOrden);

                    return UnidadReservable.builder()
                            .idUnidad(u.getIdUnidad())
                            .idAlojamiento(u.getIdAlojamiento())
                            .idTipoEspacio(u.getTipoEspacio() != null ? u.getTipoEspacio().getIdTipoEspacio() : null)
                            .nombre(u.getNombre())
                            .capacidadHuespedes(u.getCapacidadHuespedes())
                            .cantidadDormitorios(u.getCantidadDormitorios())
                            .cantidadCamas(u.getCantidadCamas())
                            .cantidadBanos(u.getCantidadBanos())
                            .inventarioTotal(u.getInventarioTotal())
                            .precioNoche(u.getPrecioNoche())
                            .estado(u.getEstado())
                            .fotografias(fotosUnidad)
                            .build();
                }).collect(Collectors.toList())
                : new ArrayList<>();

        return Alojamiento.builder()
                .idAlojamiento(entity.getIdAlojamiento())
                .idAnfitrion(entity.getIdAnfitrion())
                .idTipoPropiedad(entity.getTipoPropiedad() != null ? entity.getTipoPropiedad().getIdTipoPropiedad() : null)
                .tipoPropiedad(tipoPropiedad)
                .titulo(entity.getTitulo())
                .descripcion(entity.getDescripcion())
                .direccion(entity.getDireccion())
                .ciudad(entity.getCiudad())
                .departamento(entity.getDepartamento())
                .latitud(entity.getLatitud())
                .longitud(entity.getLongitud())
                .modalidad(entity.getModalidad() != null ? entity.getModalidad() : "CASA_DEPARTAMENTO")
                .politicas(entity.getPoliticas())
                .horarioEntrada(entity.getHorarioEntrada())
                .horarioSalida(entity.getHorarioSalida())
                .motivoRechazo(entity.getMotivoRechazo())
                .motivoObservacionRechazo(entity.getMotivoObservacionRechazo() != null ? entity.getMotivoObservacionRechazo() : entity.getMotivoRechazo())
                .origenUltimoCambio(entity.getOrigenUltimoCambio())
                .estadoPublicacion(entity.getEstadoPublicacion())
                .fechaCreacion(entity.getFechaCreacion())
                .intentosRevision(entity.getIntentosRevision())
                .fechaUltimoCambioEstado(entity.getFechaUltimoCambioEstado())
                .huellaFotos(entity.getHuellaFotos())
                .idRevision(entity.getIdRevision())
                .servicios(servicios)
                .fotografias(fotografias)
                .unidades(unidades)
                .build();
    }
}
