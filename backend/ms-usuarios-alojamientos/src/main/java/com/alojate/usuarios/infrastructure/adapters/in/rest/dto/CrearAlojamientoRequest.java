package com.alojate.usuarios.infrastructure.adapters.in.rest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrearAlojamientoRequest {

    @NotNull(message = "El anfitrión es obligatorio.")
    private UUID idAnfitrion;

    private Integer idTipoPropiedad;

    @NotBlank(message = "El título es obligatorio.")
    private String titulo;

    private String descripcion;

    @NotBlank(message = "La dirección es obligatoria.")
    private String direccion;

    @NotBlank(message = "La ciudad es obligatoria.")
    private String ciudad;

    @NotBlank(message = "El departamento es obligatorio.")
    private String departamento;

    private BigDecimal latitud;
    private BigDecimal longitud;

    private String modalidad; // "CASA_DEPARTAMENTO" o "HOTEL_HOSTAL"
    private String politicas;
    private String horarioEntrada;
    private String horarioSalida;

    private Set<Integer> serviciosIds;
}
