package com.alojate.usuarios.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Alojamiento {
    private UUID idAlojamiento;
    private UUID idAnfitrion;
    private Integer idTipoPropiedad;
    private TipoPropiedad tipoPropiedad;
    private String titulo;
    private String descripcion;
    private String direccion;
    private String ciudad;
    private String departamento;
    private BigDecimal latitud;
    private BigDecimal longitud;
    private String modalidad; // "CASA_DEPARTAMENTO" o "HOTEL_HOSTAL"
    private String politicas;
    private String horarioEntrada;
    private String horarioSalida;
    private String motivoRechazo;
    private String motivoObservacionRechazo;
    private String origenUltimoCambio;
    private EstadoPublicacion estadoPublicacion;
    private LocalDateTime fechaCreacion;

    // --- Control de la revisión automática ---
    /** Fallos técnicos seguidos de la revisión automática (0 = ninguno). */
    private Integer intentosRevision;
    /** Cuándo cambió por última vez el estado (null en datos anteriores: se usa fechaCreacion). */
    private LocalDateTime fechaUltimoCambioEstado;
    /** Resumen de las fotos evaluadas en la última revisión; sirve para saber si el anfitrión corrigió algo. */
    private String huellaFotos;
    /** Identifica la revisión vigente; descarta resultados tardíos de revisiones anteriores. */
    private UUID idRevision;

    @Builder.Default
    private Set<Servicio> servicios = new HashSet<>();

    @Builder.Default
    private List<Fotografia> fotografias = new ArrayList<>();

    @Builder.Default
    private List<UnidadReservable> unidades = new ArrayList<>();

    public boolean estaPublicado() {
        return this.estadoPublicacion == EstadoPublicacion.PUBLICADO;
    }

    public int intentosRevisionActuales() {
        return intentosRevision != null ? intentosRevision : 0;
    }

    /** Fecha desde la que se miden esperas y tiempos agotados. */
    public LocalDateTime fechaReferenciaEstado() {
        return fechaUltimoCambioEstado != null ? fechaUltimoCambioEstado : fechaCreacion;
    }
}
