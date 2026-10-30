package com.alojate.usuarios.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {
    private UUID idUsuario;
    private Integer idRol;
    private Rol rol;
    private String tipoCuenta;
    private String nombre;
    private String apellido;
    private String email;
    private String telefono;
    private String passwordHash;
    private String ci;
    private String ciComplemento;
    private String ciExpedido;
    private String telefonoEmergencia;
    private String direccionDomicilio;
    private String departamentoRadicatoria;
    private String bancoNombre;
    private String numeroCuentaBancaria;
    private EstadoUsuario estado;
    private LocalDateTime fechaRegistro;
    private LocalDateTime fechaActualizacion;

    public boolean esAdministrador() {
        return this.rol != null && this.rol.esAdministrador();
    }

    public boolean esAnfitrion() {
        return this.rol != null && this.rol.esAnfitrion();
    }

    public boolean esCliente() {
        return this.rol != null && this.rol.esCliente();
    }

    public boolean estaActivo() {
        return this.estado == EstadoUsuario.ACTIVO;
    }
}
