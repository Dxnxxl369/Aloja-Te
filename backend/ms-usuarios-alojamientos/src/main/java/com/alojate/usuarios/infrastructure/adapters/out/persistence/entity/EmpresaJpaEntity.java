package com.alojate.usuarios.infrastructure.adapters.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "empresas")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmpresaJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_empresa", updatable = false, nullable = false)
    private UUID idEmpresa;

    @Column(name = "razon_social", nullable = false, length = 150)
    private String razonSocial;

    @Column(name = "nombre_comercial", length = 150)
    private String nombreComercial;

    @Column(length = 50)
    private String nit;

    @Column(name = "representante_legal", length = 150)
    private String representanteLegal;

    @Column(length = 30)
    private String telefono;

    @Column(length = 150)
    private String email;

    @Column(length = 255)
    private String direccion;

    @Column(length = 100)
    private String ciudad;

    @Column(length = 100)
    private String departamento;

    @Column(length = 100)
    private String pais;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "sitio_web", length = 255)
    private String sitioWeb;

    @Column(nullable = false)
    private Boolean activo;
}
