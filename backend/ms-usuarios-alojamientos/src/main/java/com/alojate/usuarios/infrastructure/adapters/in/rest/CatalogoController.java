package com.alojate.usuarios.infrastructure.adapters.in.rest;

import com.alojate.usuarios.domain.model.Servicio;
import com.alojate.usuarios.domain.model.TipoEspacio;
import com.alojate.usuarios.domain.model.TipoPropiedad;
import com.alojate.usuarios.domain.ports.in.CatalogoUseCase;
import com.alojate.usuarios.infrastructure.adapters.in.rest.dto.ServicioDto;
import com.alojate.usuarios.infrastructure.adapters.in.rest.dto.TipoEspacioDto;
import com.alojate.usuarios.infrastructure.adapters.in.rest.dto.TipoPropiedadDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/catalogos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CatalogoController {

    private final CatalogoUseCase catalogoUseCase;

    // --- TIPOS DE PROPIEDAD ---
    @GetMapping("/tipos-propiedad")
    public ResponseEntity<List<TipoPropiedadDto>> listarTiposPropiedad() {
        return ResponseEntity.ok(catalogoUseCase.listarTiposPropiedad().stream()
                .map(t -> TipoPropiedadDto.builder().idTipoPropiedad(t.getIdTipoPropiedad()).nombre(t.getNombre()).build())
                .collect(Collectors.toList()));
    }

    @PostMapping("/tipos-propiedad")
    public ResponseEntity<TipoPropiedadDto> crearTipoPropiedad(@RequestBody TipoPropiedadDto dto) {
        TipoPropiedad guardado = catalogoUseCase.crearTipoPropiedad(dto.getNombre());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(TipoPropiedadDto.builder().idTipoPropiedad(guardado.getIdTipoPropiedad()).nombre(guardado.getNombre()).build());
    }

    // --- TIPOS DE ESPACIO ---
    @GetMapping("/tipos-espacio")
    public ResponseEntity<List<TipoEspacioDto>> listarTiposEspacio() {
        return ResponseEntity.ok(catalogoUseCase.listarTiposEspacio().stream()
                .map(t -> TipoEspacioDto.builder().idTipoEspacio(t.getIdTipoEspacio()).nombre(t.getNombre()).build())
                .collect(Collectors.toList()));
    }

    @PostMapping("/tipos-espacio")
    public ResponseEntity<TipoEspacioDto> crearTipoEspacio(@RequestBody TipoEspacioDto dto) {
        TipoEspacio guardado = catalogoUseCase.crearTipoEspacio(dto.getNombre());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(TipoEspacioDto.builder().idTipoEspacio(guardado.getIdTipoEspacio()).nombre(guardado.getNombre()).build());
    }

    // --- SERVICIOS ---
    @GetMapping("/servicios")
    public ResponseEntity<List<ServicioDto>> listarServicios(@RequestParam(required = false) String categoria) {
        List<Servicio> list = (categoria != null && !categoria.isBlank())
                ? catalogoUseCase.listarServiciosPorCategoria(categoria)
                : catalogoUseCase.listarServicios();

        return ResponseEntity.ok(list.stream()
                .map(s -> ServicioDto.builder().idServicio(s.getIdServicio()).nombre(s.getNombre()).categoria(s.getCategoria()).build())
                .collect(Collectors.toList()));
    }

    @PostMapping("/servicios")
    public ResponseEntity<ServicioDto> crearServicio(@RequestBody ServicioDto dto) {
        Servicio guardado = catalogoUseCase.crearServicio(dto.getNombre(), dto.getCategoria());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ServicioDto.builder().idServicio(guardado.getIdServicio()).nombre(guardado.getNombre()).categoria(guardado.getCategoria()).build());
    }
}
