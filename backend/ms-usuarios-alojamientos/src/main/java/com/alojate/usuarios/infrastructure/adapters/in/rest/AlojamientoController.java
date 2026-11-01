package com.alojate.usuarios.infrastructure.adapters.in.rest;

import com.alojate.usuarios.domain.model.Alojamiento;
import com.alojate.usuarios.domain.model.EstadoPublicacion;
import com.alojate.usuarios.domain.model.Fotografia;
import com.alojate.usuarios.domain.ports.in.AlojamientoUseCase;
import com.alojate.usuarios.infrastructure.adapters.in.rest.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/alojamientos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AlojamientoController {

    private final AlojamientoUseCase alojamientoUseCase;

    @GetMapping
    public ResponseEntity<List<AlojamientoDto>> buscarAlojamientos(
            @RequestParam(required = false) String ciudad,
            @RequestParam(required = false) String departamento,
            @RequestParam(required = false) Integer tipoPropiedad,
            @RequestParam(required = false) BigDecimal precioMax,
            @RequestParam(required = false) Integer minHuespedes) {

        List<Alojamiento> alojamientos = alojamientoUseCase.buscarPublicados(
                ciudad, departamento, tipoPropiedad, precioMax, minHuespedes
        );
        return ResponseEntity.ok(alojamientos.stream().map(this::toDto).collect(Collectors.toList()));
    }

    @GetMapping("/todos")
    public ResponseEntity<List<AlojamientoDto>> listarTodos() {
        return ResponseEntity.ok(alojamientoUseCase.listarTodos().stream().map(this::toDto).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlojamientoDto> obtenerPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(toDto(alojamientoUseCase.obtenerPorId(id)));
    }

    @GetMapping("/anfitrion/{idAnfitrion}")
    public ResponseEntity<List<AlojamientoDto>> listarPorAnfitrion(@PathVariable UUID idAnfitrion) {
        return ResponseEntity.ok(alojamientoUseCase.listarPorAnfitrion(idAnfitrion).stream().map(this::toDto).collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<AlojamientoDto> crearAlojamiento(@Valid @RequestBody CrearAlojamientoRequest request) {
        Alojamiento alojamiento = Alojamiento.builder()
                .idAnfitrion(request.getIdAnfitrion())
                .idTipoPropiedad(request.getIdTipoPropiedad())
                .titulo(request.getTitulo())
                .descripcion(request.getDescripcion())
                .direccion(request.getDireccion())
                .ciudad(request.getCiudad())
                .departamento(request.getDepartamento())
                .latitud(request.getLatitud())
                .longitud(request.getLongitud())
                .modalidad(request.getModalidad() != null ? request.getModalidad() : "CASA_DEPARTAMENTO")
                .politicas(request.getPoliticas())
                .horarioEntrada(request.getHorarioEntrada())
                .horarioSalida(request.getHorarioSalida())
                .build();

        Alojamiento guardado = alojamientoUseCase.crearAlojamiento(alojamiento, request.getServiciosIds());
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(guardado));
    }

    // --- BANDEJA DE MODERACIÓN ADMINISTRATIVA ---
    @GetMapping("/moderacion")
    public ResponseEntity<List<AlojamientoDto>> listarModeracionPorEstado(
            @RequestParam(required = false) EstadoPublicacion estado) {
        List<Alojamiento> lista = (estado != null)
                ? alojamientoUseCase.listarPorEstado(estado)
                : alojamientoUseCase.listarPendientesModeracion();
        return ResponseEntity.ok(lista.stream().map(this::toDto).collect(Collectors.toList()));
    }

    @GetMapping("/moderacion/pendientes")
    public ResponseEntity<List<AlojamientoDto>> listarPendientesModeracion() {
        return ResponseEntity.ok(alojamientoUseCase.listarPorEstado(EstadoPublicacion.PENDIENTE).stream()
                .map(this::toDto)
                .collect(Collectors.toList()));
    }

    @PostMapping("/{id}/aceptar")
    public ResponseEntity<AlojamientoDto> aceptarAlojamiento(@PathVariable UUID id) {
        return ResponseEntity.ok(toDto(alojamientoUseCase.aceptarAlojamiento(id)));
    }

    @PostMapping("/{id}/observar")
    public ResponseEntity<AlojamientoDto> observarAlojamiento(
            @PathVariable UUID id,
            @RequestBody(required = false) DecisionModeracionRequest request) {
        String motivo = request != null && request.getMotivo() != null ? request.getMotivo() : "Observación por auditoría";
        String origen = request != null && request.getOrigen() != null ? request.getOrigen() : "MANUAL";
        return ResponseEntity.ok(toDto(alojamientoUseCase.observarAlojamiento(id, motivo, origen)));
    }

    @PostMapping("/{id}/rechazar")
    public ResponseEntity<AlojamientoDto> rechazarAlojamiento(
            @PathVariable UUID id,
            @RequestBody(required = false) DecisionModeracionRequest request) {
        String motivo = request != null ? request.getMotivo() : null;
        return ResponseEntity.ok(toDto(alojamientoUseCase.rechazarAlojamiento(id, motivo)));
    }

    @PostMapping("/{id}/suspender")
    public ResponseEntity<AlojamientoDto> suspenderAlojamiento(
            @PathVariable UUID id,
            @RequestBody(required = false) DecisionModeracionRequest request) {
        String motivo = request != null ? request.getMotivo() : null;
        return ResponseEntity.ok(toDto(alojamientoUseCase.suspenderAlojamiento(id, motivo)));
    }

    @PostMapping("/{id}/enviar-revision")
    public ResponseEntity<AlojamientoDto> enviarARevision(@PathVariable UUID id) {
        return ResponseEntity.ok(toDto(alojamientoUseCase.enviarARevision(id)));
    }

    // --- MODALIDAD CASA VS HOTEL ---
    @PutMapping("/{id}/oferta-unica")
    public ResponseEntity<AlojamientoDto> configurarOfertaUnica(
            @PathVariable UUID id,
            @RequestBody ConfigurarOfertaUnicaRequest req) {
        Alojamiento aloj = alojamientoUseCase.configurarOfertaUnica(
                id, req.getPrecioNoche(), req.getCapacidadHuespedes(),
                req.getCantidadDormitorios(), req.getCantidadCamas(), req.getCantidadBanos()
        );
        return ResponseEntity.ok(toDto(aloj));
    }

    @PostMapping("/{id}/habitaciones")
    public ResponseEntity<UnidadReservableDto> agregarHabitacionHotel(
            @PathVariable UUID id,
            @RequestBody AgregarHabitacionRequest req) {
        com.alojate.usuarios.domain.model.UnidadReservable u = alojamientoUseCase.agregarHabitacionHotel(
                id, req.getNombre(), req.getPrecioNoche(), req.getInventarioTotal(),
                req.getCapacidadHuespedes(), req.getCantidadDormitorios(), req.getCantidadCamas(),
                req.getCantidadBanos(), req.getIdTipoEspacio()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(toUnidadDto(u));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AlojamientoDto> actualizarAlojamiento(
            @PathVariable UUID id,
            @RequestBody ActualizarAlojamientoRequest request) {
        Alojamiento datos = Alojamiento.builder()
                .idTipoPropiedad(request.getIdTipoPropiedad())
                .titulo(request.getTitulo())
                .descripcion(request.getDescripcion())
                .direccion(request.getDireccion())
                .ciudad(request.getCiudad())
                .departamento(request.getDepartamento())
                .latitud(request.getLatitud())
                .longitud(request.getLongitud())
                .build();

        Alojamiento actualizado = alojamientoUseCase.actualizarAlojamiento(id, datos, request.getServiciosIds());
        return ResponseEntity.ok(toDto(actualizado));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<AlojamientoDto> cambiarEstado(
            @PathVariable UUID id,
            @RequestParam(required = false) EstadoPublicacion estado,
            @RequestParam(required = false) String motivo,
            @RequestParam(required = false) String origen,
            @RequestBody(required = false) DecisionModeracionRequest body) {
        
        EstadoPublicacion nuevoEstado = estado != null ? estado : (body != null ? body.getNuevoEstado() : null);
        String motivoFinal = motivo != null ? motivo : (body != null ? body.getMotivo() : null);
        String origenFinal = origen != null ? origen : (body != null ? body.getOrigen() : null);

        if (nuevoEstado == null) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(toDto(alojamientoUseCase.cambiarEstado(id, nuevoEstado, motivoFinal, origenFinal)));
    }

    // --- FOTOGRAFÍAS ---
    @GetMapping("/{id}/fotografias")
    public ResponseEntity<List<FotografiaDto>> listarFotografias(@PathVariable UUID id) {
        return ResponseEntity.ok(alojamientoUseCase.listarFotografias(id).stream()
                .map(this::toFotoDto)
                .collect(Collectors.toList()));
    }

    @PostMapping("/{id}/fotografias")
    public ResponseEntity<FotografiaDto> agregarFotografia(
            @PathVariable UUID id,
            @Valid @RequestBody CrearFotografiaRequest request) {
        Fotografia foto = alojamientoUseCase.agregarFotografia(id, request.getUrl(), request.getOrden());
        return ResponseEntity.status(HttpStatus.CREATED).body(toFotoDto(foto));
    }

    @DeleteMapping("/fotografias/{idFotografia}")
    public ResponseEntity<Void> eliminarFotografia(@PathVariable UUID idFotografia) {
        alojamientoUseCase.eliminarFotografia(idFotografia);
        return ResponseEntity.noContent().build();
    }

    // --- MAPPERS ---
    private AlojamientoDto toDto(Alojamiento domain) {
        if (domain == null) return null;
        String tipoPropiedadNombre = domain.getTipoPropiedad() != null ? domain.getTipoPropiedad().getNombre() : null;

        Set<ServicioDto> serviciosDto = domain.getServicios() != null
                ? domain.getServicios().stream().map(s -> ServicioDto.builder()
                        .idServicio(s.getIdServicio())
                        .nombre(s.getNombre())
                        .categoria(s.getCategoria())
                        .build()).collect(Collectors.toSet())
                : Set.of();

        List<FotografiaDto> fotosDto = domain.getFotografias() != null
                ? domain.getFotografias().stream().map(this::toFotoDto).collect(Collectors.toList())
                : List.of();

        List<UnidadReservableDto> unidadesDto = domain.getUnidades() != null
                ? domain.getUnidades().stream().map(u -> UnidadReservableDto.builder()
                        .idUnidad(u.getIdUnidad())
                        .idAlojamiento(u.getIdAlojamiento())
                        .idTipoEspacio(u.getIdTipoEspacio())
                        .tipoEspacioNombre(u.getTipoEspacio() != null ? u.getTipoEspacio().getNombre() : null)
                        .nombre(u.getNombre())
                        .capacidadHuespedes(u.getCapacidadHuespedes())
                        .cantidadDormitorios(u.getCantidadDormitorios())
                        .cantidadCamas(u.getCantidadCamas())
                        .cantidadBanos(u.getCantidadBanos())
                        .inventarioTotal(u.getInventarioTotal())
                        .precioNoche(u.getPrecioNoche())
                        .estado(u.getEstado())
                        .build()).collect(Collectors.toList())
                : List.of();

        return AlojamientoDto.builder()
                .idAlojamiento(domain.getIdAlojamiento())
                .idAnfitrion(domain.getIdAnfitrion())
                .idTipoPropiedad(domain.getIdTipoPropiedad())
                .tipoPropiedadNombre(tipoPropiedadNombre)
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
                .estadoPublicacion(domain.getEstadoPublicacion())
                .fechaCreacion(domain.getFechaCreacion())
                .servicios(serviciosDto)
                .fotografias(fotosDto)
                .unidades(unidadesDto)
                .build();
    }

    private UnidadReservableDto toUnidadDto(com.alojate.usuarios.domain.model.UnidadReservable u) {
        if (u == null) return null;
        return UnidadReservableDto.builder()
                .idUnidad(u.getIdUnidad())
                .idAlojamiento(u.getIdAlojamiento())
                .idTipoEspacio(u.getIdTipoEspacio())
                .tipoEspacioNombre(u.getTipoEspacio() != null ? u.getTipoEspacio().getNombre() : null)
                .nombre(u.getNombre())
                .capacidadHuespedes(u.getCapacidadHuespedes())
                .cantidadDormitorios(u.getCantidadDormitorios())
                .cantidadCamas(u.getCantidadCamas())
                .cantidadBanos(u.getCantidadBanos())
                .inventarioTotal(u.getInventarioTotal())
                .precioNoche(u.getPrecioNoche())
                .estado(u.getEstado())
                .build();
    }

    private FotografiaDto toFotoDto(Fotografia f) {
        if (f == null) return null;
        return FotografiaDto.builder()
                .idFotografia(f.getIdFotografia())
                .idAlojamiento(f.getIdAlojamiento())
                .url(f.getUrl())
                .orden(f.getOrden())
                .build();
    }
}
