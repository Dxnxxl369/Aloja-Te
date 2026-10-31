package com.alojate.usuarios.infrastructure.adapters.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tipos_propiedad")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TipoPropiedadJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_propiedad")
    private Integer idTipoPropiedad;

    @Column(nullable = false, unique = true, length = 100)
    private String nombre;
}
