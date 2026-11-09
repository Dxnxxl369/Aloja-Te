package com.alojate.usuarios.domain.model;

import com.alojate.usuarios.domain.exception.TransicionEstadoInvalidaException;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static com.alojate.usuarios.domain.model.ActorPublicacion.*;
import static com.alojate.usuarios.domain.model.EstadoPublicacion.*;
import static com.alojate.usuarios.domain.model.EventoPublicacion.*;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Recorre TODAS las combinaciones (estado, evento, actor) y comprueba que solo son válidas las del diagrama
 * aprobado; cualquier otra debe lanzar TransicionEstadoInvalidaException (HTTP 409).
 */
class MaquinaEstadosPublicacionTest {

    private record Clave(EstadoPublicacion desde, EventoPublicacion evento, ActorPublicacion actor) {
    }

    /** El diagrama de estados, escrito aparte de la implementación. */
    private static Map<Clave, EstadoPublicacion> diagrama() {
        Map<Clave, EstadoPublicacion> d = new HashMap<>();
        d.put(new Clave(PENDIENTE, DISPARAR_REVISION, SISTEMA), EN_REVISION);
        d.put(new Clave(PENDIENTE, REINTENTAR_ADMIN, ADMIN), EN_REVISION);
        d.put(new Clave(EN_REVISION, IA_PUBLICA, IA), PUBLICADO);
        d.put(new Clave(EN_REVISION, IA_OBSERVA, IA), OBSERVADO);
        d.put(new Clave(EN_REVISION, IA_RECHAZA, IA), RECHAZADO);
        d.put(new Clave(EN_REVISION, ERROR_TECNICO, SISTEMA), PENDIENTE);
        d.put(new Clave(EN_REVISION, ERROR_TECNICO, IA), PENDIENTE);
        d.put(new Clave(OBSERVADO, REENVIAR_ANFITRION, ANFITRION), EN_REVISION);
        d.put(new Clave(PUBLICADO, NLP_OBSERVA, NLP), OBSERVADO);
        d.put(new Clave(PUBLICADO, SUSPENDER, ADMIN), SUSPENDIDO);
        d.put(new Clave(OBSERVADO, SUSPENDER, ADMIN), SUSPENDIDO);
        d.put(new Clave(SUSPENDIDO, REACTIVAR, ADMIN), PUBLICADO);
        return d;
    }

    @Test
    void soloLasTransicionesDelDiagramaSonValidas() {
        Map<Clave, EstadoPublicacion> esperado = diagrama();
        int validas = 0;
        int invalidas = 0;

        for (EstadoPublicacion desde : EstadoPublicacion.values()) {
            for (EventoPublicacion evento : EventoPublicacion.values()) {
                for (ActorPublicacion actor : ActorPublicacion.values()) {
                    EstadoPublicacion destino = esperado.get(new Clave(desde, evento, actor));
                    if (destino != null) {
                        assertEquals(destino, MaquinaEstadosPublicacion.aplicar(desde, evento, actor),
                                desde + " --" + evento + "/" + actor + "-->");
                        validas++;
                    } else {
                        assertThrows(TransicionEstadoInvalidaException.class,
                                () -> MaquinaEstadosPublicacion.aplicar(desde, evento, actor),
                                desde + " --" + evento + "/" + actor + "--> debía ser inválida");
                        invalidas++;
                    }
                }
            }
        }

        assertEquals(esperado.size(), validas);
        assertEquals(6 * 10 * 5 - esperado.size(), invalidas);
    }

    @Test
    void rechazadoEsFinal() {
        for (EventoPublicacion evento : EventoPublicacion.values()) {
            for (ActorPublicacion actor : ActorPublicacion.values()) {
                assertThrows(TransicionEstadoInvalidaException.class,
                        () -> MaquinaEstadosPublicacion.aplicar(RECHAZADO, evento, actor));
            }
        }
    }

    @Test
    void elAdminNoPuedePublicarObservarNiRechazar() {
        for (EstadoPublicacion desde : EstadoPublicacion.values()) {
            for (EstadoPublicacion destino : new EstadoPublicacion[]{OBSERVADO, RECHAZADO}) {
                assertThrows(TransicionEstadoInvalidaException.class,
                        () -> MaquinaEstadosPublicacion.resolverEvento(desde, destino, ADMIN));
            }
        }
        // PUBLICADO solo es alcanzable por el admin reactivando un SUSPENDIDO
        for (EstadoPublicacion desde : EstadoPublicacion.values()) {
            if (desde == SUSPENDIDO) continue;
            assertThrows(TransicionEstadoInvalidaException.class,
                    () -> MaquinaEstadosPublicacion.resolverEvento(desde, PUBLICADO, ADMIN));
        }
    }

    @Test
    void resolverEventoDeduceElEventoDeLaIaYNlp() {
        assertEquals(IA_PUBLICA, MaquinaEstadosPublicacion.resolverEvento(EN_REVISION, PUBLICADO, IA));
        assertEquals(IA_OBSERVA, MaquinaEstadosPublicacion.resolverEvento(EN_REVISION, OBSERVADO, IA));
        assertEquals(IA_RECHAZA, MaquinaEstadosPublicacion.resolverEvento(EN_REVISION, RECHAZADO, IA));
        assertEquals(ERROR_TECNICO, MaquinaEstadosPublicacion.resolverEvento(EN_REVISION, PENDIENTE, IA));
        assertEquals(NLP_OBSERVA, MaquinaEstadosPublicacion.resolverEvento(PUBLICADO, OBSERVADO, NLP));
    }

    @Test
    void laIaNoPuedeLlevarAEnRevisionNiSuspender() {
        assertThrows(TransicionEstadoInvalidaException.class,
                () -> MaquinaEstadosPublicacion.resolverEvento(PENDIENTE, EN_REVISION, IA));
        assertThrows(TransicionEstadoInvalidaException.class,
                () -> MaquinaEstadosPublicacion.resolverEvento(PUBLICADO, SUSPENDIDO, IA));
    }

    @Test
    void soloLosEventosDeInicioLlevanAEnRevision() {
        for (MaquinaEstadosPublicacion.Transicion t : MaquinaEstadosPublicacion.transiciones()) {
            assertEquals(t.hacia() == EN_REVISION, t.evento().iniciaRevision(), t.toString());
        }
    }
}
