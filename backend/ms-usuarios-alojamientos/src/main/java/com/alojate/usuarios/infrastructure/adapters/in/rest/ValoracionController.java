package com.alojate.usuarios.infrastructure.adapters.in.rest;

import com.alojate.usuarios.domain.model.Valoracion;
import com.alojate.usuarios.domain.ports.in.ValoracionUseCase;
import com.alojate.usuarios.infrastructure.adapters.in.rest.dto.CrearValoracionRequest;
import com.alojate.usuarios.infrastructure.adapters.in.rest.dto.ResumenValoracionesDto;
import com.alojate.usuarios.infrastructure.adapters.in.rest.dto.ValoracionDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ValoracionController {

    private final ValoracionUseCase valoracionUseCase;

    // Listar todas las reseñas asociadas a un alojamiento
    @GetMapping("/alojamientos/{idAlojamiento}/valoraciones")
    public ResponseEntity<List<ValoracionDto>> listarPorAlojamiento(@PathVariable UUID idAlojamiento) {
        List<Valoracion> lista = valoracionUseCase.listarPorAlojamiento(idAlojamiento);
        return ResponseEntity.ok(lista.stream().map(this::toDto).collect(Collectors.toList()));
    }

    // Listar reseñas exclusivamente generales del Hotel (instalaciones, desayuno, recepción)
    @GetMapping("/alojamientos/{idAlojamiento}/valoraciones/hotel")
    public ResponseEntity<List<ValoracionDto>> listarGeneralesHotel(@PathVariable UUID idAlojamiento) {
        List<Valoracion> lista = valoracionUseCase.listarGeneralesHotel(idAlojamiento);
        return ResponseEntity.ok(lista.stream().map(this::toDto).collect(Collectors.toList()));
    }

    // Listar reseñas de una habitación específica del hotel
    @GetMapping("/alojamientos/{idAlojamiento}/unidades/{idUnidad}/valoraciones")
    public ResponseEntity<List<ValoracionDto>> listarPorUnidad(
            @PathVariable UUID idAlojamiento,
            @PathVariable UUID idUnidad) {
        List<Valoracion> lista = valoracionUseCase.listarPorUnidad(idUnidad);
        return ResponseEntity.ok(lista.stream().map(this::toDto).collect(Collectors.toList()));
    }

    // Listar directamente por id de unidad
    @GetMapping("/unidades/{idUnidad}/valoraciones")
    public ResponseEntity<List<ValoracionDto>> listarDirectoPorUnidad(@PathVariable UUID idUnidad) {
        List<Valoracion> lista = valoracionUseCase.listarPorUnidad(idUnidad);
        return ResponseEntity.ok(lista.stream().map(this::toDto).collect(Collectors.toList()));
    }

    // Registrar nueva reseña (con o sin idUnidad)
    @PostMapping("/alojamientos/{idAlojamiento}/valoraciones")
    public ResponseEntity<ValoracionDto> crearValoracion(
            @PathVariable UUID idAlojamiento,
            @Valid @RequestBody CrearValoracionRequest req) {

        Valoracion domain = Valoracion.builder()
                .idAlojamiento(idAlojamiento)
                .idUnidad(req.getIdUnidad())
                .idUsuario(req.getIdUsuario())
                .idReserva(req.getIdReserva())
                .puntuacionGeneral(req.getPuntuacionGeneral())
                .calificacionLimpieza(req.getCalificacionLimpieza())
                .calificacionUbicacion(req.getCalificacionUbicacion())
                .calificacionCalidadPrecio(req.getCalificacionCalidadPrecio())
                .calificacionServicio(req.getCalificacionServicio())
                .calificacionComodidad(req.getCalificacionComodidad())
                .esAnonimo(Boolean.TRUE.equals(req.getEsAnonimo()))
                .comentario(req.getComentario())
                .sentimientoNlp(req.getSentimientoNlp())
                .confianzaNlp(req.getConfianzaNlp())
                .topicoPredicho(req.getTopicoPredicho())
                .build();

        Valoracion guardada = valoracionUseCase.registrarValoracion(domain);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(guardada));
    }

    // Resumen estadístico de los 5 atributos y distribución de sentimientos por alojamiento
    @GetMapping("/alojamientos/{idAlojamiento}/valoraciones/resumen")
    public ResponseEntity<ResumenValoracionesDto> obtenerResumen(@PathVariable UUID idAlojamiento) {
        List<Valoracion> lista = valoracionUseCase.listarPorAlojamiento(idAlojamiento);
        return ResponseEntity.ok(calcularResumen(lista));
    }

    // Resumen estadístico específico de una habitación/unidad del hotel
    @GetMapping({"/unidades/{idUnidad}/valoraciones/resumen", "/alojamientos/{idAlojamiento}/unidades/{idUnidad}/valoraciones/resumen"})
    public ResponseEntity<ResumenValoracionesDto> obtenerResumenUnidad(@PathVariable UUID idUnidad) {
        List<Valoracion> lista = valoracionUseCase.listarPorUnidad(idUnidad);
        return ResponseEntity.ok(calcularResumen(lista));
    }

    private ResumenValoracionesDto calcularResumen(List<Valoracion> lista) {
        if (lista.isEmpty()) {
            return ResumenValoracionesDto.builder()
                    .calificacionPromedio(new BigDecimal("5.00"))
                    .totalResenas(0)
                    .promedioLimpieza(new BigDecimal("5.0"))
                    .promedioUbicacion(new BigDecimal("5.0"))
                    .promedioCalidadPrecio(new BigDecimal("5.0"))
                    .promedioServicio(new BigDecimal("5.0"))
                    .promedioComodidad(new BigDecimal("5.0"))
                    .conteoPositivos(0)
                    .conteoNeutros(0)
                    .conteoNegativos(0)
                    .build();
        }

        int total = lista.size();
        double sumGen = 0, sumLimp = 0, sumUbi = 0, sumCal = 0, sumServ = 0, sumCom = 0;
        int pos = 0, neu = 0, neg = 0;

        for (Valoracion v : lista) {
            sumGen += v.getPuntuacionGeneral();
            sumLimp += (v.getCalificacionLimpieza() != null ? v.getCalificacionLimpieza() : v.getPuntuacionGeneral());
            sumUbi += (v.getCalificacionUbicacion() != null ? v.getCalificacionUbicacion() : v.getPuntuacionGeneral());
            sumCal += (v.getCalificacionCalidadPrecio() != null ? v.getCalificacionCalidadPrecio() : v.getPuntuacionGeneral());
            sumServ += (v.getCalificacionServicio() != null ? v.getCalificacionServicio() : v.getPuntuacionGeneral());
            sumCom += (v.getCalificacionComodidad() != null ? v.getCalificacionComodidad() : v.getPuntuacionGeneral());

            if ("POSITIVO".equalsIgnoreCase(v.getSentimientoNlp())) pos++;
            else if ("NEUTRO".equalsIgnoreCase(v.getSentimientoNlp())) neu++;
            else neg++;
        }

        return ResumenValoracionesDto.builder()
                .calificacionPromedio(BigDecimal.valueOf(sumGen / total).setScale(2, RoundingMode.HALF_UP))
                .totalResenas(total)
                .promedioLimpieza(BigDecimal.valueOf(sumLimp / total).setScale(1, RoundingMode.HALF_UP))
                .promedioUbicacion(BigDecimal.valueOf(sumUbi / total).setScale(1, RoundingMode.HALF_UP))
                .promedioCalidadPrecio(BigDecimal.valueOf(sumCal / total).setScale(1, RoundingMode.HALF_UP))
                .promedioServicio(BigDecimal.valueOf(sumServ / total).setScale(1, RoundingMode.HALF_UP))
                .promedioComodidad(BigDecimal.valueOf(sumCom / total).setScale(1, RoundingMode.HALF_UP))
                .conteoPositivos(pos)
                .conteoNeutros(neu)
                .conteoNegativos(neg)
                .build();
    }

    private ValoracionDto toDto(Valoracion v) {
        return ValoracionDto.builder()
                .idValoracion(v.getIdValoracion())
                .idAlojamiento(v.getIdAlojamiento())
                .idUnidad(v.getIdUnidad())
                .idUsuario(v.getIdUsuario())
                .nombreUsuario(v.getNombreUsuario())
                .idReserva(v.getIdReserva())
                .puntuacionGeneral(v.getPuntuacionGeneral())
                .calificacionLimpieza(v.getCalificacionLimpieza())
                .calificacionUbicacion(v.getCalificacionUbicacion())
                .calificacionCalidadPrecio(v.getCalificacionCalidadPrecio())
                .calificacionServicio(v.getCalificacionServicio())
                .calificacionComodidad(v.getCalificacionComodidad())
                .esAnonimo(v.getEsAnonimo())
                .comentario(v.getComentario())
                .sentimientoNlp(v.getSentimientoNlp())
                .confianzaNlp(v.getConfianzaNlp())
                .topicoPredicho(v.getTopicoPredicho())
                .fechaCreacion(v.getFechaCreacion())
                .build();
    }
}
