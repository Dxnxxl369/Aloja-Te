package com.alojate.usuarios.application.service;

import com.alojate.usuarios.domain.model.Alojamiento;
import com.alojate.usuarios.domain.model.EstadoPublicacion;
import com.alojate.usuarios.domain.model.UnidadReservable;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Reglas de tiempo y reintentos de la revisión automática. Los valores se configuran en
 * {@code application.yml} bajo {@code moderacion.revision}; aquí no se toca ningún estado,
 * solo se responde a preguntas como "¿puede reintentarse ya?" o "¿se agotó el tiempo?".
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "moderacion.revision")
public class PoliticaRevision {

    /** Fallos técnicos seguidos tras los cuales el alojamiento pasa a "requiere atención". */
    private int maxIntentos = 3;
    /** Espera antes de cada reintento (el último valor se repite si hay más intentos que valores). */
    private List<Integer> esperasMinutos = List.of(1, 5, 15);
    /** Tiempo mínimo que se espera a que el anfitrión termine el registro antes de que el job lo envíe. */
    private int graciaRegistroMinutos = 10;
    /** Límite de EN_REVISION = base + porFoto × número de fotos. */
    private int limiteBaseMinutos = 3;
    private int limitePorFotoMinutos = 2;
    /** Revisiones simultáneas permitidas (LlavaGuard evalúa una foto a la vez). */
    private int cupoConcurrente = 1;

    /** PENDIENTE que ya agotó sus reintentos automáticos: solo el admin puede reintentarlo. */
    public boolean requiereAtencion(Alojamiento a) {
        return a.getEstadoPublicacion() == EstadoPublicacion.PENDIENTE
                && a.intentosRevisionActuales() >= maxIntentos;
    }

    /** Hora desde la que el job puede reenviar el alojamiento; null si no aplica (no está en cola). */
    public LocalDateTime proximoReintento(Alojamiento a) {
        if (a.getEstadoPublicacion() != EstadoPublicacion.PENDIENTE || requiereAtencion(a)) {
            return null;
        }
        LocalDateTime referencia = a.fechaReferenciaEstado();
        if (referencia == null) {
            return null;
        }
        int intentos = a.intentosRevisionActuales();
        Duration espera = intentos == 0
                ? Duration.ofMinutes(graciaRegistroMinutos)
                : Duration.ofMinutes(esperaTrasFallo(intentos));
        return referencia.plus(espera);
    }

    /** Minutos de espera tras el fallo número {@code intentos} (1 = primer fallo). */
    public int esperaTrasFallo(int intentos) {
        if (esperasMinutos == null || esperasMinutos.isEmpty()) {
            return 1;
        }
        int indice = Math.min(Math.max(intentos, 1), esperasMinutos.size()) - 1;
        return esperasMinutos.get(indice);
    }

    /** ¿Está en la cola de la revisión automática y ya le toca? */
    public boolean puedeDespacharse(Alojamiento a, LocalDateTime ahora) {
        LocalDateTime proximo = proximoReintento(a);
        return proximo != null && !ahora.isBefore(proximo) && registroCompleto(a);
    }

    /** Tiempo máximo que una revisión puede estar EN_REVISION: crece con el número de fotos. */
    public Duration limiteEnRevision(Alojamiento a) {
        return Duration.ofMinutes((long) limiteBaseMinutos + (long) limitePorFotoMinutos * totalFotos(a));
    }

    public boolean revisionVencida(Alojamiento a, LocalDateTime ahora) {
        LocalDateTime referencia = a.fechaReferenciaEstado();
        return a.getEstadoPublicacion() == EstadoPublicacion.EN_REVISION
                && referencia != null
                && ahora.isAfter(referencia.plus(limiteEnRevision(a)));
    }

    /**
     * Un registro está completo cuando se puede evaluar: galería con al menos una foto, al menos una
     * unidad y, en hoteles, al menos una foto por habitación.
     */
    public boolean registroCompleto(Alojamiento a) {
        boolean hayGaleria = a.getFotografias() != null && !a.getFotografias().isEmpty();
        List<UnidadReservable> unidades = a.getUnidades();
        if (!hayGaleria || unidades == null || unidades.isEmpty()) {
            return false;
        }
        if ("HOTEL_HOSTAL".equals(a.getModalidad())) {
            return unidades.stream().allMatch(u -> u.getFotografias() != null && !u.getFotografias().isEmpty());
        }
        return true;
    }

    public int totalFotos(Alojamiento a) {
        int galeria = a.getFotografias() != null ? a.getFotografias().size() : 0;
        int habitaciones = a.getUnidades() == null ? 0 : a.getUnidades().stream()
                .mapToInt(u -> u.getFotografias() != null ? u.getFotografias().size() : 0)
                .sum();
        return galeria + habitaciones;
    }
}
