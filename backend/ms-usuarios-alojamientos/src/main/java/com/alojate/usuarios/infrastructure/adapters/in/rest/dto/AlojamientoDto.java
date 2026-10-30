package com.alojate.usuarios.infrastructure.adapters.in.rest.dto;

import com.alojate.usuarios.domain.model.EstadoPublicacion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlojamientoDto {
    private UUID idAlojamiento;
    private UUID idAnfitrion;
    private Integer idTipoPropiedad;
    private String tipoPropiedadNombre;
    private String titulo;
    private String descripcion;
    private String direccion;
    private String ciudad;
    private String departamento;
    private BigDecimal latitud;
    private BigDecimal longitud;
    private String modalidad; // "CASA_DEPARTAMENTO" o "HOTEL_HOSTAL"
    private String politicas;
    private String horarioEntrada;
    private String horarioSalida;
    private String motivoRechazo;
    private EstadoPublicacion estadoPublicacion;
    private LocalDateTime fechaCreacion;
    private Set<ServicioDto> servicios;
    private List<FotografiaDto> fotografias;
    private List<UnidadReservableDto> unidades;
}
