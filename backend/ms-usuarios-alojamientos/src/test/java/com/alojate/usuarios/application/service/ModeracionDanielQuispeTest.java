package com.alojate.usuarios.application.service;

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
import org.junit.jupiter.api.DisplayName;
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
import java.util.UUID;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Flujo de Moderación de Publicaciones para Daniel Quispe (danielqczn@gmail.com)")
class ModeracionDanielQuispeTest {

    private static final UUID DANIEL_ID = UUID.fromString("a0000000-0000-4000-8000-000000000004");
    private static final String DANIEL_EMAIL = "danielqczn@gmail.com";
    private static final String DANIEL_NOMBRE = "Daniel Quispe";
    private static final String DANIEL_TELEFONO = "63591455";

    private RepositorioMemoriaAlojamientos repoAlojamientos;
    private List<Fotografia> todasLasFotos;
    private NotificadorSimulado notificador;
    private PoliticaRevision politica;
    private AlojamientoServiceImpl alojamientoService;

    @BeforeEach
    void setup() {
        repoAlojamientos = new RepositorioMemoriaAlojamientos();
        todasLasFotos = new ArrayList<>();
        notificador = new NotificadorSimulado();
        politica = new PoliticaRevision();

        FotografiaRepositoryPort fotoRepo = Mockito.mock(FotografiaRepositoryPort.class);
        Mockito.when(fotoRepo.listarPorAlojamiento(Mockito.any())).thenAnswer(inv -> {
            UUID idAloj = inv.getArgument(0);
            return todasLasFotos.stream()
                    .filter(f -> idAloj.equals(f.getIdAlojamiento()))
                    .collect(Collectors.toList());
        });

        UnidadReservableRepositoryPort unidadRepo = Mockito.mock(UnidadReservableRepositoryPort.class);
        Mockito.when(unidadRepo.listarPorAlojamiento(Mockito.any())).thenAnswer(inv -> {
            UUID idAloj = inv.getArgument(0);
            Alojamiento a = repoAlojamientos.buscarPorId(idAloj).orElse(null);
            return a != null && a.getUnidades() != null ? a.getUnidades() : List.of();
        });

        PlatformTransactionManager tm = new PlatformTransactionManager() {
            public TransactionStatus getTransaction(TransactionDefinition d) { return new SimpleTransactionStatus(); }
            public void commit(TransactionStatus s) { }
            public void rollback(TransactionStatus s) { }
        };

        alojamientoService = new AlojamientoServiceImpl(
                repoAlojamientos,
                fotoRepo,
                unidadRepo,
                Mockito.mock(FotosHabitacionService.class),
                notificador,
                new TransactionTemplate(tm),
                politica
        );
    }

    @Test
    @DisplayName("1. Publicación tipo Departamento: Fotos aprobadas -> Estado PUBLICADO para Daniel Quispe")
    void testFlujoPublicacionDepartamentoAprobado() {
        UUID idAloj = UUID.randomUUID();

        // 1. Fotos limpias de la galería (sala, dormitorio, cocina)
        Fotografia f1 = Fotografia.builder().idFotografia(UUID.randomUUID()).idAlojamiento(idAloj)
                .url("https://s3.amazonaws.com/alojate/daniel/depto-living.jpg").orden(1).build();
        Fotografia f2 = Fotografia.builder().idFotografia(UUID.randomUUID()).idAlojamiento(idAloj)
                .url("https://s3.amazonaws.com/alojate/daniel/depto-dormitorio.jpg").orden(2).build();
        Fotografia f3 = Fotografia.builder().idFotografia(UUID.randomUUID()).idAlojamiento(idAloj)
                .url("https://s3.amazonaws.com/alojate/daniel/depto-cocina.jpg").orden(3).build();
        todasLasFotos.addAll(List.of(f1, f2, f3));

        UnidadReservable unidad = UnidadReservable.builder()
                .idUnidad(UUID.randomUUID())
                .idAlojamiento(idAloj)
                .nombre("Departamento Completo Calacoto")
                .precioNoche(BigDecimal.valueOf(350))
                .capacidadHuespedes(4)
                .build();

        Alojamiento depto = Alojamiento.builder()
                .idAlojamiento(idAloj)
                .idAnfitrion(DANIEL_ID)
                .titulo("Departamento Moderno en Calacoto")
                .descripcion("Hermoso departamento en la zona sur con vista panorámica y garaje.")
                .modalidad("CASA_DEPARTAMENTO")
                .estadoPublicacion(EstadoPublicacion.PENDIENTE)
                .intentosRevision(0)
                .fechaCreacion(LocalDateTime.now())
                .fechaUltimoCambioEstado(LocalDateTime.now())
                .fotografias(new ArrayList<>(List.of(f1, f2, f3)))
                .unidades(new ArrayList<>(List.of(unidad)))
                .build();
        repoAlojamientos.guardar(depto);

        // 2. Anfitrión Daniel envía a revisión automática
        Alojamiento enRevision = alojamientoService.enviarARevision(idAloj);
        assertEquals(EstadoPublicacion.EN_REVISION, enRevision.getEstadoPublicacion(), "Pasa a EN_REVISION");
        assertNotNull(enRevision.getIdRevision(), "Genera id de revisión único");
        assertEquals(1, notificador.peticiones.size(), "n8n webhook es notificado");
        UUID idRev = enRevision.getIdRevision();

        // 3. n8n evalúa fotos -> Todas seguras -> Envía PATCH con PUBLICADO
        String motivoAprobacion = "Aprobado automáticamente: 3 fotos revisadas, sin problemas.\n"
                + "Foto 1: Habitación y estancia con iluminación natural y mobiliario.\n"
                + "Foto 2: Dormitorio principal con cama matrimonial.\n"
                + "Foto 3: Cocina equipada.";

        Alojamiento publicado = alojamientoService.cambiarEstado(
                idAloj,
                EstadoPublicacion.PUBLICADO,
                motivoAprobacion,
                "AUTOMATIZACION_VISION_IA",
                ActorPublicacion.IA,
                idRev
        );

        // 4. Verificaciones
        assertEquals(EstadoPublicacion.PUBLICADO, publicado.getEstadoPublicacion());
        assertEquals(DANIEL_ID, publicado.getIdAnfitrion());
        assertEquals("AUTOMATIZACION_VISION_IA", publicado.getOrigenUltimoCambio());
        assertTrue(publicado.getMotivoObservacionRechazo().contains("Aprobado automáticamente"));
        assertNotNull(publicado.getIdRevision(), "idRevision conserva el identificador de la revisión evaluada");
    }

    @Test
    @DisplayName("2. Publicación tipo Hotel con Habitaciones: Foto no permitida -> Estado OBSERVADO/RECHAZADO para Daniel Quispe")
    void testFlujoPublicacionHotelConObservacion() {
        UUID idHotel = UUID.randomUUID();

        // Foto fachada hotel
        Fotografia fotoHotel = Fotografia.builder().idFotografia(UUID.randomUUID()).idAlojamiento(idHotel)
                .url("https://s3.amazonaws.com/alojate/daniel/hotel-fachada.jpg").orden(1).build();
        todasLasFotos.add(fotoHotel);

        // Habitación 1: Suite Presidencial (fotos correctas)
        UUID idSuite = UUID.randomUUID();
        Fotografia fSuite = Fotografia.builder().idFotografia(UUID.randomUUID()).idAlojamiento(idHotel)
                .idUnidad(idSuite).url("https://s3.amazonaws.com/alojate/daniel/suite-foto.jpg").orden(1).build();
        todasLasFotos.add(fSuite);
        UnidadReservable suite = UnidadReservable.builder()
                .idUnidad(idSuite)
                .idAlojamiento(idHotel)
                .nombre("Suite Presidencial")
                .precioNoche(BigDecimal.valueOf(800))
                .capacidadHuespedes(2)
                .fotografias(new ArrayList<>(List.of(fSuite)))
                .build();

        // Habitación 2: Habitación Doble (foto con contenido no permitido/observado)
        UUID idDoble = UUID.randomUUID();
        Fotografia fDobleObservada = Fotografia.builder().idFotografia(UUID.randomUUID()).idAlojamiento(idHotel)
                .idUnidad(idDoble).url("https://s3.amazonaws.com/alojate/daniel/doble-flagged.jpg").orden(1).build();
        todasLasFotos.add(fDobleObservada);
        UnidadReservable doble = UnidadReservable.builder()
                .idUnidad(idDoble)
                .idAlojamiento(idHotel)
                .nombre("Habitación Doble Superior")
                .precioNoche(BigDecimal.valueOf(450))
                .capacidadHuespedes(2)
                .fotografias(new ArrayList<>(List.of(fDobleObservada)))
                .build();

        Alojamiento hotel = Alojamiento.builder()
                .idAlojamiento(idHotel)
                .idAnfitrion(DANIEL_ID)
                .titulo("Hotel Boutique Real & Spa Illimani")
                .descripcion("Exclusivo hotel boutique en La Paz con spa y habitaciones de lujo.")
                .modalidad("HOTEL_HOSTAL")
                .estadoPublicacion(EstadoPublicacion.PENDIENTE)
                .intentosRevision(0)
                .fechaCreacion(LocalDateTime.now())
                .fechaUltimoCambioEstado(LocalDateTime.now())
                .fotografias(new ArrayList<>(List.of(fotoHotel, fSuite, fDobleObservada)))
                .unidades(new ArrayList<>(List.of(suite, doble)))
                .build();
        repoAlojamientos.guardar(hotel);

        // 2. Anfitrión envía a revisión
        Alojamiento enRevision = alojamientoService.enviarARevision(idHotel);
        assertEquals(EstadoPublicacion.EN_REVISION, enRevision.getEstadoPublicacion());
        UUID idRev = enRevision.getIdRevision();

        // 3. n8n detecta contenido observado en la habitación doble
        String motivoObservacion = "Observado: contenido dudoso en Habitación Doble Superior, foto 1 (contenido no permitido).\n"
                + "Habitación Doble Superior, foto 1: La imagen contiene elementos no aptos para el catálogo público.\n"
                + "Sin problemas: Galería, foto 1, Suite Presidencial, foto 1.";

        Alojamiento observado = alojamientoService.cambiarEstado(
                idHotel,
                EstadoPublicacion.OBSERVADO,
                motivoObservacion,
                "AUTOMATIZACION_VISION_IA",
                ActorPublicacion.IA,
                idRev
        );

        // 4. Verificaciones
        assertEquals(EstadoPublicacion.OBSERVADO, observado.getEstadoPublicacion());
        assertEquals(DANIEL_ID, observado.getIdAnfitrion());
        assertEquals("AUTOMATIZACION_VISION_IA", observado.getOrigenUltimoCambio());
        assertTrue(observado.getMotivoObservacionRechazo().contains("Observado"));
        assertTrue(observado.getMotivoObservacionRechazo().contains("Habitación Doble Superior"));
    }

    @Test
    @DisplayName("3. Verificación de Auditoría para Administrador: Bandeja de Moderación")
    void testVerificacionBandejaAdministrador() {
        testFlujoPublicacionDepartamentoAprobado();
        testFlujoPublicacionHotelConObservacion();

        List<Alojamiento> publicados = alojamientoService.listarPorEstado(EstadoPublicacion.PUBLICADO);
        List<Alojamiento> observados = alojamientoService.listarPorEstado(EstadoPublicacion.OBSERVADO);

        assertFalse(publicados.isEmpty(), "Existe al menos un alojamiento PUBLICADO");
        assertFalse(observados.isEmpty(), "Existe al menos un alojamiento OBSERVADO");

        Alojamiento miDepto = publicados.stream()
                .filter(a -> DANIEL_ID.equals(a.getIdAnfitrion()))
                .findFirst()
                .orElse(null);
        assertNotNull(miDepto, "El departamento de Daniel Quispe está en la lista de PUBLICADOS");
        assertEquals("Departamento Moderno en Calacoto", miDepto.getTitulo());

        Alojamiento miHotel = observados.stream()
                .filter(a -> DANIEL_ID.equals(a.getIdAnfitrion()))
                .findFirst()
                .orElse(null);
        assertNotNull(miHotel, "El hotel de Daniel Quispe está en la lista de OBSERVADOS");
        assertEquals("Hotel Boutique Real & Spa Illimani", miHotel.getTitulo());
    }

    // --- Clases auxiliares para simulación en memoria ---
    static class RepositorioMemoriaAlojamientos implements AlojamientoRepositoryPort {
        private final Map<UUID, Alojamiento> mapa = new LinkedHashMap<>();

        @Override
        public Alojamiento guardar(Alojamiento a) {
            mapa.put(a.getIdAlojamiento(), a);
            return a;
        }

        @Override
        public Optional<Alojamiento> buscarPorId(UUID id) {
            return Optional.ofNullable(mapa.get(id));
        }

        @Override
        public List<Alojamiento> listarTodos() {
            return new ArrayList<>(mapa.values());
        }

        @Override
        public List<Alojamiento> listarPorEstado(EstadoPublicacion estado) {
            return mapa.values().stream().filter(a -> a.getEstadoPublicacion() == estado).collect(Collectors.toList());
        }

        @Override
        public List<Alojamiento> listarPorAnfitrion(UUID idAnfitrion) {
            return mapa.values().stream().filter(a -> idAnfitrion.equals(a.getIdAnfitrion())).collect(Collectors.toList());
        }

        @Override
        public long contarPorEstado(EstadoPublicacion estado) {
            return mapa.values().stream().filter(a -> a.getEstadoPublicacion() == estado).count();
        }

        @Override
        public List<Alojamiento> buscarAvanzada(String ciudad, String departamento, Integer idTipoPropiedad, BigDecimal precioMax, Integer huespedes) {
            return List.of();
        }

        @Override
        public void sincronizarServicios(UUID idAlojamiento, java.util.Set<Integer> serviciosIds) {
        }
    }

    static class NotificadorSimulado implements ModeracionNotificadorPort {
        final List<UUID[]> peticiones = new ArrayList<>();
        @Override
        public void solicitarModeracion(UUID idAlojamiento, UUID idRevision) {
            peticiones.add(new UUID[]{idAlojamiento, idRevision});
        }
    }
}
