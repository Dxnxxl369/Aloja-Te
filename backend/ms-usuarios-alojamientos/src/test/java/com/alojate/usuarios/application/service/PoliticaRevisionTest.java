package com.alojate.usuarios.application.service;

import com.alojate.usuarios.domain.model.Alojamiento;
import com.alojate.usuarios.domain.model.EstadoPublicacion;
import com.alojate.usuarios.domain.model.Fotografia;
import com.alojate.usuarios.domain.model.UnidadReservable;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class PoliticaRevisionTest {

    private final PoliticaRevision politica = new PoliticaRevision();
    private final LocalDateTime t0 = LocalDateTime.of(2026, 11, 8, 10, 0);

    private Fotografia foto(String url) {
        return Fotografia.builder().url(url).orden(1).build();
    }

    private Alojamiento casa(EstadoPublicacion estado, int intentos) {
        return Alojamiento.builder()
                .idAlojamiento(UUID.randomUUID())
                .modalidad("CASA_DEPARTAMENTO")
                .estadoPublicacion(estado)
                .intentosRevision(intentos)
                .fechaCreacion(t0)
                .fechaUltimoCambioEstado(t0)
                .fotografias(List.of(foto("https://x/1.jpg")))
                .unidades(List.of(UnidadReservable.builder().idUnidad(UUID.randomUUID()).build()))
                .build();
    }

    @Test
    void requiereAtencionSoloEnPendienteConIntentosAgotados() {
        assertFalse(politica.requiereAtencion(casa(EstadoPublicacion.PENDIENTE, 2)));
        assertTrue(politica.requiereAtencion(casa(EstadoPublicacion.PENDIENTE, 3)));
        assertFalse(politica.requiereAtencion(casa(EstadoPublicacion.EN_REVISION, 3)));
    }

    @Test
    void esperasCrecientesYElUltimoValorSeRepite() {
        assertEquals(1, politica.esperaTrasFallo(1));
        assertEquals(5, politica.esperaTrasFallo(2));
        assertEquals(15, politica.esperaTrasFallo(3));
        assertEquals(15, politica.esperaTrasFallo(7));
    }

    @Test
    void proximoReintentoUsaGraciaSinFallosYEsperaConFallos() {
        assertEquals(t0.plusMinutes(10), politica.proximoReintento(casa(EstadoPublicacion.PENDIENTE, 0)));
        assertEquals(t0.plusMinutes(1), politica.proximoReintento(casa(EstadoPublicacion.PENDIENTE, 1)));
        assertEquals(t0.plusMinutes(5), politica.proximoReintento(casa(EstadoPublicacion.PENDIENTE, 2)));
        assertNull(politica.proximoReintento(casa(EstadoPublicacion.PENDIENTE, 3)), "agotado: ya no se reintenta solo");
        assertNull(politica.proximoReintento(casa(EstadoPublicacion.OBSERVADO, 0)));
    }

    @Test
    void puedeDespacharseSoloCuandoLlegaSuHora() {
        Alojamiento a = casa(EstadoPublicacion.PENDIENTE, 1);
        assertFalse(politica.puedeDespacharse(a, t0.plusSeconds(30)));
        assertTrue(politica.puedeDespacharse(a, t0.plusMinutes(1)));
    }

    @Test
    void registroIncompletoNoSeDespacha() {
        Alojamiento sinFotos = casa(EstadoPublicacion.PENDIENTE, 1);
        sinFotos.setFotografias(List.of());
        assertFalse(politica.puedeDespacharse(sinFotos, t0.plusHours(1)));
    }

    @Test
    void hotelRequiereFotoEnCadaHabitacion() {
        Alojamiento hotel = casa(EstadoPublicacion.PENDIENTE, 0);
        hotel.setModalidad("HOTEL_HOSTAL");
        UnidadReservable conFoto = UnidadReservable.builder().idUnidad(UUID.randomUUID())
                .fotografias(List.of(foto("https://x/h1.jpg"))).build();
        UnidadReservable sinFoto = UnidadReservable.builder().idUnidad(UUID.randomUUID()).fotografias(List.of()).build();

        hotel.setUnidades(List.of(conFoto, sinFoto));
        assertFalse(politica.registroCompleto(hotel));

        hotel.setUnidades(List.of(conFoto));
        assertTrue(politica.registroCompleto(hotel));
    }

    @Test
    void limiteDeRevisionCreceConElNumeroDeFotos() {
        Alojamiento hotel = casa(EstadoPublicacion.EN_REVISION, 0);
        hotel.setUnidades(List.of(UnidadReservable.builder().fotografias(List.of(foto("a"), foto("b"))).build()));
        // 1 foto de galería + 2 de la habitación = 3 fotos -> 3 + 2*3 = 9 min
        assertEquals(3, politica.totalFotos(hotel));
        assertEquals(9, politica.limiteEnRevision(hotel).toMinutes());
        assertFalse(politica.revisionVencida(hotel, t0.plusMinutes(9)));
        assertTrue(politica.revisionVencida(hotel, t0.plusMinutes(10)));
    }

    @Test
    void sinFechaDeCambioSeUsaLaFechaDeCreacion() {
        Alojamiento a = casa(EstadoPublicacion.EN_REVISION, 0);
        a.setFechaUltimoCambioEstado(null);
        assertTrue(politica.revisionVencida(a, t0.plusHours(1)));
    }
}
