package com.alojate.usuarios.infrastructure.adapters.in.rest.dto;

import com.alojate.usuarios.domain.model.EstadoUnidad;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
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
    /** Fotos propias de la habitación (la primera, por orden, es la portada). */
    private List<FotografiaDto> fotografias;
    /** Mismas fotos como lista de URLs, para los clientes que solo necesitan el enlace. */
    private List<String> fotos;
}
