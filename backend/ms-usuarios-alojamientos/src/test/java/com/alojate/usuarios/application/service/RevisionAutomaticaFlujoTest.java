package com.alojate.usuarios.application.service;

import com.alojate.usuarios.domain.exception.ModeracionNoDisponibleException;
import com.alojate.usuarios.domain.exception.TransicionEstadoInvalidaException;
import com.alojate.usuarios.domain.model.ActorPublicacion;
import com.alojate.usuarios.domain.model.Alojamiento;
import com.alojate.usuarios.domain.model.EstadoPublicacion;
import com.alojate.usuarios.domain.model.Fotografia;
import com.alojate.usuarios.domain.model.UnidadReservable;
import com.alojate.usuarios.domain.ports.out.AlojamientoRepositoryPort;
import com.alojate.usuarios.domain.ports.out.FotografiaRepositoryPort;
import com.alojate.usuarios.domain.ports.out.ModeracionNotificadorPort;
import com.alojate.usuarios.domain.ports.out.UnidadReservableRepositoryPort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.SimpleTransactionStatus;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Flujo completo de la revisión automática sobre repositorios en memoria: disparo, reintentos,
 * tiempo agotado, reenvío del anfitrión, resultados tardíos y permisos por actor.
 */
class RevisionAutomaticaFlujoTest {

    private FakeAlojamientos alojamientos;
    private List<Fotografia> fotos;
    private FakeNotificador notificador;
    private PoliticaRevision politica;
    private AlojamientoServiceImpl servicio;
    private RevisionAutomaticaService ciclo;

    @BeforeEach
    void preparar() {
        alojamientos = new FakeAlojamientos();
        fotos = new ArrayList<>();
        notificador = new FakeNotificador();
        politica = new PoliticaRevision();

        FotografiaRepositoryPort fotoRepo = Mockito.mock(FotografiaRepositoryPort.class);
        Mockito.when(fotoRepo.listarPorAlojamiento(Mockito.any())).thenAnswer(inv -> new ArrayList<>(fotos));
        UnidadReservableRepositoryPort unidadRepo = Mockito.mock(UnidadReservableRepositoryPort.class);
        Mockito.when(unidadRepo.listarPorAlojamiento(Mockito.any())).thenReturn(List.of());

        PlatformTransactionManager tm = new PlatformTransactionManager() {
            public TransactionStatus getTransaction(TransactionDefinition d) { return new SimpleTransactionStatus(); }
            public void commit(TransactionStatus s) { }
            public void rollback(TransactionStatus s) { }
        };

        servicio = new AlojamientoServiceImpl(alojamientos, fotoRepo, unidadRepo,
                Mockito.mock(FotosHabitacionService.class), notificador, new TransactionTemplate(tm), politica);
        ciclo = new RevisionAutomaticaService(alojamientos, servicio, politica);
    }

    // ---------- utilidades ----------

    private Alojamiento nuevaCasa(EstadoPublicacion estado) {
        UUID id = UUID.randomUUID();
        Fotografia galeria = Fotografia.builder().idFotografia(UUID.randomUUID()).idAlojamiento(id)
                .url("https://s3/" + id + "/1.jpg").orden(1).build();
        fotos.add(galeria);
        Alojamiento a = Alojamiento.builder()
                .idAlojamiento(id).modalidad("CASA_DEPARTAMENTO").estadoPublicacion(estado)
                .intentosRevision(0)
                .fechaCreacion(LocalDateTime.now().minusHours(1))
                .fechaUltimoCambioEstado(LocalDateTime.now().minusHours(1))
                .fotografias(new ArrayList<>(List.of(galeria)))
                .unidades(new ArrayList<>(List.of(UnidadReservable.builder().idUnidad(UUID.randomUUID()).idAlojamiento(id).build())))
                .build();
        alojamientos.guardar(a);
        return a;
    }

    private EstadoPublicacion estado(Alojamiento a) {
        return alojamientos.buscarPorId(a.getIdAlojamiento()).orElseThrow().getEstadoPublicacion();
    }

    // ---------- disparo ----------

    @Test
    void registroCompletoPasaAEnRevisionYAvisaAlWorkflowConSuIdDeRevision() {
        Alojamiento a = nuevaCasa(EstadoPublicacion.PENDIENTE);

        Alojamiento r = servicio.enviarARevision(a.getIdAlojamiento());

        assertEquals(EstadoPublicacion.EN_REVISION, r.getEstadoPublicacion());
        assertNotNull(r.getIdRevision());
        assertNotNull(r.getHuellaFotos());
        assertEquals(1, notificador.avisos.size());
        assertEquals(r.getIdRevision(), notificador.avisos.get(0)[1]);
    }

    @Test
    void registroIncompletoNoSeEnvia() {
        Alojamiento a = nuevaCasa(EstadoPublicacion.PENDIENTE);
        a.setFotografias(new ArrayList<>());

        assertThrows(TransicionEstadoInvalidaException.class, () -> servicio.enviarARevision(a.getIdAlojamiento()));
        assertEquals(EstadoPublicacion.PENDIENTE, estado(a));
        assertTrue(notificador.avisos.isEmpty());
    }

    @Test
    void sinCupoSeQuedaPendienteYNoAvisa() {
        nuevaCasa(EstadoPublicacion.EN_REVISION);
        Alojamiento segunda = nuevaCasa(EstadoPublicacion.PENDIENTE);

        Alojamiento r = servicio.enviarARevision(segunda.getIdAlojamiento());

        assertEquals(EstadoPublicacion.PENDIENTE, r.getEstadoPublicacion());
        assertTrue(notificador.avisos.isEmpty());
    }

    @Test
    void siElWebhookFallaVuelveAPendienteSumaUnIntentoYNoLanzaError() {
        notificador.caido = true;
        Alojamiento a = nuevaCasa(EstadoPublicacion.PENDIENTE);

        Alojamiento r = servicio.enviarARevision(a.getIdAlojamiento());

        assertEquals(EstadoPublicacion.PENDIENTE, r.getEstadoPublicacion());
        assertEquals(1, r.intentosRevisionActuales());
        assertFalse(politica.requiereAtencion(r));
    }

    // ---------- reintentos y atención ----------

    @Test
    void tresFallosSeguidosMarcanAtencionYElJobDejaDeReintentar() {
        notificador.caido = true;
        Alojamiento a = nuevaCasa(EstadoPublicacion.PENDIENTE);

        for (int i = 0; i < 3; i++) {
            // simula que ya pasó la espera antes de cada reintento
            alojamientos.buscarPorId(a.getIdAlojamiento()).orElseThrow()
                    .setFechaUltimoCambioEstado(LocalDateTime.now().minusHours(1));
            ciclo.ejecutarCiclo();
        }

        Alojamiento actual = alojamientos.buscarPorId(a.getIdAlojamiento()).orElseThrow();
        assertEquals(3, actual.intentosRevisionActuales());
        assertTrue(politica.requiereAtencion(actual));
        assertEquals(3, notificador.avisos.size());

        actual.setFechaUltimoCambioEstado(LocalDateTime.now().minusHours(5));
        ciclo.ejecutarCiclo();
        assertEquals(3, notificador.avisos.size(), "agotado: el job ya no lo envía");
        assertThrows(TransicionEstadoInvalidaException.class, () -> servicio.enviarARevision(a.getIdAlojamiento()));
    }

    @Test
    void elAdminReintentaSoloSiRequiereAtencionYReiniciaElContador() {
        Alojamiento a = nuevaCasa(EstadoPublicacion.PENDIENTE);
        assertThrows(TransicionEstadoInvalidaException.class, () -> servicio.reintentarRevision(a.getIdAlojamiento()),
                "sin atención no se puede reintentar a mano");

        a.setIntentosRevision(3);
        Alojamiento r = servicio.reintentarRevision(a.getIdAlojamiento());

        assertEquals(EstadoPublicacion.EN_REVISION, r.getEstadoPublicacion());
        assertEquals(0, r.intentosRevisionActuales());
        assertEquals(1, notificador.avisos.size());
    }

    @Test
    void elAdminVeElFalloSiElWebhookSigueCaido() {
        Alojamiento a = nuevaCasa(EstadoPublicacion.PENDIENTE);
        a.setIntentosRevision(3);
        notificador.caido = true;

        assertThrows(ModeracionNoDisponibleException.class, () -> servicio.reintentarRevision(a.getIdAlojamiento()));
        assertEquals(EstadoPublicacion.PENDIENTE, estado(a));
        assertEquals(1, alojamientos.buscarPorId(a.getIdAlojamiento()).orElseThrow().intentosRevisionActuales());
    }

    @Test
    void elJobNoToqueUnRegistroRecienCreado() {
        Alojamiento a = nuevaCasa(EstadoPublicacion.PENDIENTE);
        a.setFechaUltimoCambioEstado(LocalDateTime.now());

        ciclo.ejecutarCiclo();

        assertEquals(EstadoPublicacion.PENDIENTE, estado(a));
        assertTrue(notificador.avisos.isEmpty(), "el portal aún puede estar terminando el registro");
    }

    // ---------- tiempo agotado ----------

    @Test
    void elVigilanteDevuelveAPendienteUnaRevisionSinRespuestaYLaReintenta() {
        Alojamiento a = nuevaCasa(EstadoPublicacion.PENDIENTE);
        servicio.enviarARevision(a.getIdAlojamiento());
        UUID primera = alojamientos.buscarPorId(a.getIdAlojamiento()).orElseThrow().getIdRevision();

        // n8n nunca responde: pasa más tiempo que el límite (3 min + 2 min × 1 foto = 5 min)
        alojamientos.buscarPorId(a.getIdAlojamiento()).orElseThrow()
                .setFechaUltimoCambioEstado(LocalDateTime.now().minusMinutes(6));
        ciclo.ejecutarCiclo();

        Alojamiento actual = alojamientos.buscarPorId(a.getIdAlojamiento()).orElseThrow();
        assertEquals(1, actual.intentosRevisionActuales());
        assertEquals(EstadoPublicacion.PENDIENTE, actual.getEstadoPublicacion(), "espera 1 minuto antes del reintento");

        actual.setFechaUltimoCambioEstado(LocalDateTime.now().minusMinutes(2));
        ciclo.ejecutarCiclo();

        actual = alojamientos.buscarPorId(a.getIdAlojamiento()).orElseThrow();
        assertEquals(EstadoPublicacion.EN_REVISION, actual.getEstadoPublicacion());
        assertNotEquals(primera, actual.getIdRevision());
    }

    @Test
    void elResultadoTardioDeUnaRevisionAnteriorSeDescarta() {
        Alojamiento a = nuevaCasa(EstadoPublicacion.PENDIENTE);
        servicio.enviarARevision(a.getIdAlojamiento());
        UUID vieja = alojamientos.buscarPorId(a.getIdAlojamiento()).orElseThrow().getIdRevision();

        servicio.vencerRevision(a.getIdAlojamiento());
        alojamientos.buscarPorId(a.getIdAlojamiento()).orElseThrow()
                .setFechaUltimoCambioEstado(LocalDateTime.now().minusHours(1));
        servicio.enviarARevision(a.getIdAlojamiento()); // nueva revisión

        assertThrows(TransicionEstadoInvalidaException.class, () -> servicio.cambiarEstado(
                a.getIdAlojamiento(), EstadoPublicacion.PUBLICADO, null, "AUTOMATIZACION_VISION_IA", ActorPublicacion.IA, vieja));
        assertEquals(EstadoPublicacion.EN_REVISION, estado(a));
    }

    // ---------- decisiones de la IA y permisos ----------

    @Test
    void laIaPublicaYSeLimpianLosIntentos() {
        Alojamiento a = nuevaCasa(EstadoPublicacion.PENDIENTE);
        a.setIntentosRevision(2);
        Alojamiento enRevision = servicio.enviarARevision(a.getIdAlojamiento());

        Alojamiento r = servicio.cambiarEstado(a.getIdAlojamiento(), EstadoPublicacion.PUBLICADO, null,
                "AUTOMATIZACION_VISION_IA", ActorPublicacion.IA, enRevision.getIdRevision());

        assertEquals(EstadoPublicacion.PUBLICADO, r.getEstadoPublicacion());
        assertEquals(0, r.intentosRevisionActuales());
    }

    @Test
    void nadieMasQueLaIaPuedePublicarObservarORechazar() {
        Alojamiento a = nuevaCasa(EstadoPublicacion.PENDIENTE);
        servicio.enviarARevision(a.getIdAlojamiento());

        for (EstadoPublicacion destino : List.of(EstadoPublicacion.PUBLICADO, EstadoPublicacion.OBSERVADO, EstadoPublicacion.RECHAZADO)) {
            for (ActorPublicacion actor : List.of(ActorPublicacion.ADMIN, ActorPublicacion.ANFITRION, ActorPublicacion.SISTEMA)) {
                assertThrows(TransicionEstadoInvalidaException.class, () -> servicio.cambiarEstado(
                        a.getIdAlojamiento(), destino, "x", "MANUAL", actor, null), actor + " -> " + destino);
            }
        }
        assertEquals(EstadoPublicacion.EN_REVISION, estado(a));
    }

    @Test
    void rechazadoEsFinal() {
        Alojamiento a = nuevaCasa(EstadoPublicacion.RECHAZADO);
        assertThrows(TransicionEstadoInvalidaException.class, () -> servicio.enviarARevision(a.getIdAlojamiento()));
        assertThrows(TransicionEstadoInvalidaException.class, () -> servicio.reactivarAlojamiento(a.getIdAlojamiento()));
        assertThrows(TransicionEstadoInvalidaException.class, () -> servicio.suspenderAlojamiento(a.getIdAlojamiento(), null));
    }

    // ---------- reenvío del anfitrión ----------

    private Alojamiento observadoPorLaIa() {
        Alojamiento a = nuevaCasa(EstadoPublicacion.PENDIENTE);
        Alojamiento enRevision = servicio.enviarARevision(a.getIdAlojamiento());
        return servicio.cambiarEstado(a.getIdAlojamiento(), EstadoPublicacion.OBSERVADO, "Foto borrosa",
                "AUTOMATIZACION_VISION_IA", ActorPublicacion.IA, enRevision.getIdRevision());
    }

    @Test
    void reenviarSinCambiarLasFotosSeRechaza() {
        Alojamiento a = observadoPorLaIa();

        assertThrows(TransicionEstadoInvalidaException.class, () -> servicio.enviarARevision(a.getIdAlojamiento()));
        assertEquals(EstadoPublicacion.OBSERVADO, estado(a));
        assertEquals(1, notificador.avisos.size(), "no se volvió a llamar al webhook");
    }

    @Test
    void reenviarTrasCambiarUnaFotoVuelveAEnRevisionYLlamaAlWebhook() {
        Alojamiento a = observadoPorLaIa();
        fotos.add(Fotografia.builder().idAlojamiento(a.getIdAlojamiento()).url("https://s3/nueva.jpg").orden(2).build());

        Alojamiento r = servicio.enviarARevision(a.getIdAlojamiento());

        assertEquals(EstadoPublicacion.EN_REVISION, r.getEstadoPublicacion());
        assertEquals(2, notificador.avisos.size());
    }

    @Test
    void unObservadoPorNlpSePuedeReenviarSinCambiarFotos() {
        Alojamiento a = nuevaCasa(EstadoPublicacion.PUBLICADO);
        servicio.cambiarEstado(a.getIdAlojamiento(), EstadoPublicacion.OBSERVADO, "Reseñas con quejas",
                "ANALISIS_NLP", ActorPublicacion.NLP, null);

        Alojamiento r = servicio.enviarARevision(a.getIdAlojamiento());

        assertEquals(EstadoPublicacion.EN_REVISION, r.getEstadoPublicacion());
    }

    // ---------- suspensión ----------

    @Test
    void elAdminSuspendeYReactivaDirectoAPublicado() {
        Alojamiento a = nuevaCasa(EstadoPublicacion.PUBLICADO);

        assertEquals(EstadoPublicacion.SUSPENDIDO, servicio.suspenderAlojamiento(a.getIdAlojamiento(), "Auditoría").getEstadoPublicacion());
        assertEquals(EstadoPublicacion.PUBLICADO, servicio.reactivarAlojamiento(a.getIdAlojamiento()).getEstadoPublicacion());
    }

    @Test
    void laListaDeAtencionSoloTienePendientesAgotados() {
        Alojamiento agotado = nuevaCasa(EstadoPublicacion.PENDIENTE);
        agotado.setIntentosRevision(3);
        nuevaCasa(EstadoPublicacion.PENDIENTE);
        nuevaCasa(EstadoPublicacion.EN_REVISION).setIntentosRevision(5);

        List<UUID> ids = servicio.listarRequierenAtencion().stream().map(Alojamiento::getIdAlojamiento).collect(Collectors.toList());

        assertEquals(List.of(agotado.getIdAlojamiento()), ids);
    }

    // ---------- dobles de prueba ----------

    private static class FakeNotificador implements ModeracionNotificadorPort {
        final List<Object[]> avisos = new ArrayList<>();
        boolean caido;

        @Override
        public void solicitarModeracion(UUID idAlojamiento, UUID idRevision) {
            if (caido) {
                avisos.add(new Object[]{idAlojamiento, idRevision});
                throw new ModeracionNoDisponibleException("n8n caído");
            }
            avisos.add(new Object[]{idAlojamiento, idRevision});
        }
    }

    private static class FakeAlojamientos implements AlojamientoRepositoryPort {
        private final Map<UUID, Alojamiento> datos = new LinkedHashMap<>();

        @Override public Alojamiento guardar(Alojamiento a) { datos.put(a.getIdAlojamiento(), a); return a; }
        @Override public Optional<Alojamiento> buscarPorId(UUID id) { return Optional.ofNullable(datos.get(id)); }
        @Override public List<Alojamiento> listarTodos() { return new ArrayList<>(datos.values()); }
        @Override public List<Alojamiento> listarPorAnfitrion(UUID id) { return List.of(); }
        @Override public List<Alojamiento> listarPorEstado(EstadoPublicacion e) {
            return datos.values().stream().filter(a -> a.getEstadoPublicacion() == e).collect(Collectors.toList());
        }
        @Override public long contarPorEstado(EstadoPublicacion e) { return listarPorEstado(e).size(); }
        @Override public List<Alojamiento> buscarAvanzada(String c, String d, Integer t, BigDecimal p, Integer h) { return List.of(); }
        @Override public void sincronizarServicios(UUID id, Set<Integer> ids) { }
    }
}
