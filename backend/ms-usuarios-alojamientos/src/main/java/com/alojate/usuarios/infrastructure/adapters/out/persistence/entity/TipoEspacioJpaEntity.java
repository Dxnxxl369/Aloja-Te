package com.alojate.usuarios.infrastructure.adapters.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tipos_espacio")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TipoEspacioJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_espacio")
    private Integer idTipoEspacio;

    @Column(nullable = false, unique = true, length = 100)
    private String nombre;
}
