package com.alojate.usuarios.infrastructure.adapters.in.rest.dto;

import com.alojate.usuarios.domain.model.EstadoUnidad;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnidadReservableDto {
    private UUID idUnidad;
    private UUID idAlojamiento;
    private Integer idTipoEspacio;
    private String tipoEspacioNombre;
    private String nombre;
    private Integer capacidadHuespedes;
    private Integer cantidadDormitorios;
    private Integer cantidadCamas;
    private BigDecimal cantidadBanos;
    private Integer inventarioTotal;
    private BigDecimal precioNoche;
    private EstadoUnidad estado;
}
