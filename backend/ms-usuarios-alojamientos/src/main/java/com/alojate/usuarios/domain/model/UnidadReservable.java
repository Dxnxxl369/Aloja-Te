package com.alojate.usuarios.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnidadReservable {
    private UUID idUnidad;
    private UUID idAlojamiento;
    private Integer idTipoEspacio;
    private TipoEspacio tipoEspacio;
    private String nombre;
    private Integer capacidadHuespedes;
    private Integer cantidadDormitorios;
    private Integer cantidadCamas;
    private BigDecimal cantidadBanos;
    private Integer inventarioTotal;
    private BigDecimal precioNoche;
    private EstadoUnidad estado;

    public boolean estaDisponible() {
        return this.estado == EstadoUnidad.DISPONIBLE && this.inventarioTotal != null && this.inventarioTotal > 0;
    }
}
