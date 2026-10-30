package com.alojate.usuarios.infrastructure.adapters.in.rest.dto;

import com.alojate.usuarios.domain.model.EstadoUnidad;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrearUnidadRequest {

    @NotBlank(message = "El nombre de la unidad es obligatorio.")
    private String nombre;

    private Integer idTipoEspacio;

    @NotNull(message = "La capacidad de huéspedes es obligatoria.")
    @Min(value = 1, message = "La capacidad mínima es de 1 huésped.")
    private Integer capacidadHuespedes;

    @Min(value = 0, message = "La cantidad de dormitorios no puede ser negativa.")
    private Integer cantidadDormitorios;

    @Min(value = 1, message = "Debe tener al menos 1 cama.")
    private Integer cantidadCamas;

    private BigDecimal cantidadBanos;

    @NotNull(message = "El inventario total es obligatorio.")
    @Min(value = 1, message = "El inventario mínimo es de 1 unidad.")
    private Integer inventarioTotal;

    @NotNull(message = "El precio por noche es obligatorio.")
    @DecimalMin(value = "0.0", message = "El precio no puede ser negativo.")
    private BigDecimal precioNoche;

    private EstadoUnidad estado;
}
