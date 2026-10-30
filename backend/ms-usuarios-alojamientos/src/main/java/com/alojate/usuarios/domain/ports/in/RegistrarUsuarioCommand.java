package com.alojate.usuarios.domain.ports.in;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RegistrarUsuarioCommand {
    private String email;
    private String password;
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
    private String rol;
    private String tipoCuenta;
}
