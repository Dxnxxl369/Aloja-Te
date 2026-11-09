package com.alojate.usuarios.domain.model;

import com.alojate.usuarios.domain.exception.TransicionEstadoInvalidaException;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

import static com.alojate.usuarios.domain.model.ActorPublicacion.*;
import static com.alojate.usuarios.domain.model.EstadoPublicacion.*;
import static com.alojate.usuarios.domain.model.EventoPublicacion.*;

/**
 * Máquina de estados del ciclo de publicación. La tabla {@link #TABLA} es la única fuente de verdad:
 * cualquier combinación (estado, evento, actor) que no figure en ella es una transición inválida.
 *
 * <pre>
 * PENDIENTE   --DISPARAR_REVISION (sistema)-----> EN_REVISION
 * PENDIENTE   --REINTENTAR_ADMIN (admin)--------> EN_REVISION
 * EN_REVISION --IA_PUBLICA (ia)-----------------> PUBLICADO
 * EN_REVISION --IA_OBSERVA (ia)-----------------> OBSERVADO
 * EN_REVISION --IA_RECHAZA (ia)-----------------> RECHAZADO (final)
 * EN_REVISION --ERROR_TECNICO (sistema, ia)-----> PENDIENTE
 * OBSERVADO   --REENVIAR_ANFITRION (anfitrión)--> EN_REVISION
 * PUBLICADO   --NLP_OBSERVA (nlp)---------------> OBSERVADO
 * PUBLICADO / OBSERVADO --SUSPENDER (admin)-----> SUSPENDIDO
 * SUSPENDIDO  --REACTIVAR (admin)---------------> PUBLICADO
 * </pre>
 */
public final class MaquinaEstadosPublicacion {

    /** Una fila de la tabla: desde qué estado, con qué evento, hacia dónde y quién puede hacerlo. */
    public record Transicion(EstadoPublicacion desde, EventoPublicacion evento,
                             EstadoPublicacion hacia, Set<ActorPublicacion> actores) {
    }

    private static final List<Transicion> TABLA = new ArrayList<>();

    static {
        regla(PENDIENTE,   DISPARAR_REVISION,   EN_REVISION, SISTEMA);
        regla(PENDIENTE,   REINTENTAR_ADMIN,    EN_REVISION, ADMIN);

        regla(EN_REVISION, IA_PUBLICA,          PUBLICADO,   IA);
        regla(EN_REVISION, IA_OBSERVA,          OBSERVADO,   IA);
        regla(EN_REVISION, IA_RECHAZA,          RECHAZADO,   IA);
        regla(EN_REVISION, ERROR_TECNICO,       PENDIENTE,   SISTEMA, IA);

        regla(OBSERVADO,   REENVIAR_ANFITRION,  EN_REVISION, ANFITRION);

        regla(PUBLICADO,   NLP_OBSERVA,         OBSERVADO,   NLP);
        regla(PUBLICADO,   SUSPENDER,           SUSPENDIDO,  ADMIN);
        regla(OBSERVADO,   SUSPENDER,           SUSPENDIDO,  ADMIN);
        regla(SUSPENDIDO,  REACTIVAR,           PUBLICADO,   ADMIN);
    }

    private MaquinaEstadosPublicacion() {
    }

    private static void regla(EstadoPublicacion desde, EventoPublicacion evento,
                              EstadoPublicacion hacia, ActorPublicacion... actores) {
        TABLA.add(new Transicion(desde, evento, hacia, EnumSet.copyOf(Arrays.asList(actores))));
    }

    /** Todas las transiciones válidas (útil para pruebas y documentación). */
    public static List<Transicion> transiciones() {
        return Collections.unmodifiableList(TABLA);
    }

    /**
     * Devuelve el estado al que lleva {@code evento} desde {@code actual} si {@code actor} puede provocarlo.
     *
     * @throws TransicionEstadoInvalidaException si la combinación no está en la tabla (HTTP 409)
     */
    public static EstadoPublicacion aplicar(EstadoPublicacion actual, EventoPublicacion evento, ActorPublicacion actor) {
        for (Transicion t : TABLA) {
            if (t.desde() == actual && t.evento() == evento && t.actores().contains(actor)) {
                return t.hacia();
            }
        }
        throw new TransicionEstadoInvalidaException(
                "Transición no permitida: el evento " + evento + " del actor " + actor
                        + " no es válido para un alojamiento en estado " + actual + ".");
    }

    /**
     * Deduce el evento que lleva de {@code actual} a {@code destino} para ese actor (se usa cuando el
     * cliente solo informa el estado deseado, p. ej. el PATCH de n8n).
     *
     * @throws TransicionEstadoInvalidaException si ningún evento permite ese cambio (HTTP 409)
     */
    public static EventoPublicacion resolverEvento(EstadoPublicacion actual, EstadoPublicacion destino, ActorPublicacion actor) {
        for (Transicion t : TABLA) {
            if (t.desde() == actual && t.hacia() == destino && t.actores().contains(actor)) {
                return t.evento();
            }
        }
        throw new TransicionEstadoInvalidaException(
                "Transición no permitida: " + actual + " -> " + destino + " para el actor " + actor + ".");
    }
}
