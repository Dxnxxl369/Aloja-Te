package com.alojate.usuarios.infrastructure.adapters.in.rest;

import com.alojate.usuarios.domain.model.EstadoUnidad;
import com.alojate.usuarios.domain.model.UnidadReservable;
import com.alojate.usuarios.domain.ports.in.UnidadReservableUseCase;
import com.alojate.usuarios.infrastructure.adapters.in.rest.dto.CrearUnidadRequest;
import com.alojate.usuarios.infrastructure.adapters.in.rest.dto.UnidadReservableDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UnidadReservableController {

    private final UnidadReservableUseCase unidadUseCase;

    @GetMapping("/alojamientos/{alojamientoId}/unidades")
    public ResponseEntity<List<UnidadReservableDto>> listarPorAlojamiento(@PathVariable UUID alojamientoId) {
        return ResponseEntity.ok(unidadUseCase.listarPorAlojamiento(alojamientoId).stream()
                .map(this::toDto)
                .collect(Collectors.toList()));
    }

    @GetMapping("/unidades/{id}")
    public ResponseEntity<UnidadReservableDto> obtenerPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(toDto(unidadUseCase.obtenerPorId(id)));
    }

    @PostMapping("/alojamientos/{alojamientoId}/unidades")
    public ResponseEntity<UnidadReservableDto> crearUnidad(
            @PathVariable UUID alojamientoId,
            @Valid @RequestBody CrearUnidadRequest request) {

        UnidadReservable unidad = UnidadReservable.builder()
                .idTipoEspacio(request.getIdTipoEspacio())
                .nombre(request.getNombre())
                .capacidadHuespedes(request.getCapacidadHuespedes())
                .cantidadDormitorios(request.getCantidadDormitorios())
                .cantidadCamas(request.getCantidadCamas())
                .cantidadBanos(request.getCantidadBanos())
                .inventarioTotal(request.getInventarioTotal())
                .precioNoche(request.getPrecioNoche())
                .estado(request.getEstado() != null ? request.getEstado() : EstadoUnidad.DISPONIBLE)
                .build();

        UnidadReservable guardada = unidadUseCase.crearUnidad(alojamientoId, unidad);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(guardada));
    }

    @PutMapping("/unidades/{id}")
    public ResponseEntity<UnidadReservableDto> actualizarUnidad(
            @PathVariable UUID id,
            @RequestBody CrearUnidadRequest request) {

        UnidadReservable datos = UnidadReservable.builder()
                .idTipoEspacio(request.getIdTipoEspacio())
                .nombre(request.getNombre())
                .capacidadHuespedes(request.getCapacidadHuespedes())
                .cantidadDormitorios(request.getCantidadDormitorios())
                .cantidadCamas(request.getCantidadCamas())
                .cantidadBanos(request.getCantidadBanos())
                .inventarioTotal(request.getInventarioTotal())
                .precioNoche(request.getPrecioNoche())
                .estado(request.getEstado())
                .build();

        UnidadReservable actualizada = unidadUseCase.actualizarUnidad(id, datos);
        return ResponseEntity.ok(toDto(actualizada));
    }

    @PatchMapping("/unidades/{id}/estado")
    public ResponseEntity<UnidadReservableDto> cambiarEstado(
            @PathVariable UUID id,
            @RequestParam EstadoUnidad estado) {
        return ResponseEntity.ok(toDto(unidadUseCase.cambiarEstado(id, estado)));
    }

    @DeleteMapping("/unidades/{id}")
    public ResponseEntity<Void> eliminarUnidad(@PathVariable UUID id) {
        unidadUseCase.eliminarUnidad(id);
        return ResponseEntity.noContent().build();
    }

    private UnidadReservableDto toDto(UnidadReservable u) {
        if (u == null) return null;
        String tipoEspacioNombre = u.getTipoEspacio() != null ? u.getTipoEspacio().getNombre() : null;

        return UnidadReservableDto.builder()
                .idUnidad(u.getIdUnidad())
                .idAlojamiento(u.getIdAlojamiento())
                .idTipoEspacio(u.getIdTipoEspacio())
                .tipoEspacioNombre(tipoEspacioNombre)
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
}
