package com.alojate.usuarios.infrastructure.adapters.in.rest.dto;

import com.alojate.usuarios.domain.model.EstadoUsuario;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioDto {
    private UUID idUsuario;
    private Integer idRol;
    private String rolNombre;
    private String tipoCuenta;
    private String nombre;
    private String apellido;
    private String email;
    private String telefono;
    private String ci;
    private String ciExpedido;
    private EstadoUsuario estado;
    private LocalDateTime fechaRegistro;
}
