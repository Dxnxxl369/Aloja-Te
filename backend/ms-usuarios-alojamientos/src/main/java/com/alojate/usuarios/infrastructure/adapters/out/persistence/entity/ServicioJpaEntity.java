package com.alojate.usuarios.infrastructure.adapters.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "servicios", indexes = {
        @Index(name = "idx_servicio_categoria", columnList = "categoria")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServicioJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_servicio")
    private Integer idServicio;

    @Column(nullable = false, unique = true, length = 100)
    private String nombre;

    @Column(length = 60)
    private String categoria;
}
