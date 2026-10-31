package com.alojate.usuarios.infrastructure.adapters.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "fotografias", indexes = {
        @Index(name = "idx_foto_alojamiento", columnList = "id_alojamiento")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FotografiaJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_fotografia", updatable = false, nullable = false)
    private UUID idFotografia;

    @Column(name = "id_alojamiento", nullable = false)
    private UUID idAlojamiento;

    @Column(nullable = false, length = 500)
    private String url;

    @Column(nullable = false)
    private Integer orden;
}
