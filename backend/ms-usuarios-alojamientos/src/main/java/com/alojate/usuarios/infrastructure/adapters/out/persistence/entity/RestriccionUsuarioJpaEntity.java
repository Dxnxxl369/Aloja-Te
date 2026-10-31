package com.alojate.usuarios.infrastructure.adapters.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "restricciones_usuario", indexes = {
        @Index(name = "idx_restr_usuario", columnList = "id_usuario"),
        @Index(name = "idx_restr_activa", columnList = "activa")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestriccionUsuarioJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_restriccion", updatable = false, nullable = false)
    private UUID idRestriccion;

    @Column(name = "id_usuario", nullable = false)
    private UUID idUsuario;

    @Column(name = "id_permiso", nullable = false)
    private Integer idPermiso;

    @Column(name = "id_administrador")
    private UUID idAdministrador;

    @Column(length = 255)
    private String motivo;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDateTime fechaFin;

    @Column(nullable = false)
    private Boolean activa;
}
