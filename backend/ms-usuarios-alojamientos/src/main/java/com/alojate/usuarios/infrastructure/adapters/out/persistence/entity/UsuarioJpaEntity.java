package com.alojate.usuarios.infrastructure.adapters.out.persistence.entity;

import com.alojate.usuarios.domain.model.EstadoUsuario;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "usuarios", indexes = {
        @Index(name = "idx_usuario_email", columnList = "email", unique = true),
        @Index(name = "idx_usuario_ci", columnList = "ci")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_usuario", updatable = false, nullable = false)
    private UUID idUsuario;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_rol", nullable = false)
    private RolJpaEntity rol;

    @Column(name = "tipo_cuenta", length = 50)
    private String tipoCuenta;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 100)
    private String apellido;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(length = 30)
    private String telefono;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(length = 30)
    private String ci;

    @Column(name = "ci_complemento", length = 10)
    private String ciComplemento;

    @Column(name = "ci_expedido", length = 10)
    private String ciExpedido;

    @Column(name = "telefono_emergencia", length = 30)
    private String telefonoEmergencia;

    @Column(name = "direccion_domicilio", length = 200)
    private String direccionDomicilio;

    @Column(name = "departamento_radicatoria", length = 50)
    private String departamentoRadicatoria;

    @Column(name = "banco_nombre", length = 100)
    private String bancoNombre;

    @Column(name = "numero_cuenta_bancaria", length = 50)
    private String numeroCuentaBancaria;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoUsuario estado;

    @Column(name = "fecha_registro", nullable = false, updatable = false)
    private LocalDateTime fechaRegistro;

    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion;
}
