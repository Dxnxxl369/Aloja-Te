package com.alojate.usuarios.infrastructure.adapters.in.rest.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistroRequest {

    @NotBlank(message = "El correo electrónico es obligatorio.")
    @Email(message = "El formato de correo no es válido.")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria.")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres.")
    private String password;

    @NotBlank(message = "El nombre es obligatorio.")
    private String nombre;

    private String apellido;

    private String ci;

    private String ciComplemento;

    private String ciExpedido;

    private String telefono;

    private String telefonoEmergencia;

    private String direccionDomicilio;

    private String departamentoRadicatoria;

    private String bancoNombre;

    private String numeroCuentaBancaria;

    private String rol; // "CLIENTE" o "ANFITRION"

    private String tipoCuenta;
}
