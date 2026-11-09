package com.alojate.usuarios.application.service;

import com.alojate.usuarios.domain.model.Fotografia;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class HuellaFotosTest {

    private Fotografia foto(UUID unidad, int orden, String url) {
        return Fotografia.builder().idUnidad(unidad).orden(orden).url(url).build();
    }

    @Test
    void mismaListaEnOtroOrdenDaLaMismaHuella() {
        Fotografia a = foto(null, 1, "https://x/a.jpg");
        Fotografia b = foto(null, 2, "https://x/b.jpg");
        assertEquals(HuellaFotos.calcular(List.of(a, b)), HuellaFotos.calcular(List.of(b, a)));
    }

    @Test
    void agregarQuitarOCambiarUnaFotoCambiaLaHuella() {
        UUID hab = UUID.randomUUID();
        Fotografia a = foto(null, 1, "https://x/a.jpg");
        Fotografia b = foto(hab, 1, "https://x/b.jpg");
        String base = HuellaFotos.calcular(List.of(a, b));

        assertNotEquals(base, HuellaFotos.calcular(List.of(a)));
        assertNotEquals(base, HuellaFotos.calcular(List.of(a, b, foto(hab, 2, "https://x/c.jpg"))));
        assertNotEquals(base, HuellaFotos.calcular(List.of(a, foto(hab, 1, "https://x/otra.jpg"))));
        assertNotEquals(base, HuellaFotos.calcular(List.of(a, foto(hab, 2, "https://x/b.jpg"))), "reordenar también cuenta");
    }

    @Test
    void laMismaFotoEnGaleriaYEnHabitacionNoEsLoMismo() {
        Fotografia galeria = foto(null, 1, "https://x/a.jpg");
        Fotografia habitacion = foto(UUID.randomUUID(), 1, "https://x/a.jpg");
        assertNotEquals(HuellaFotos.calcular(List.of(galeria)), HuellaFotos.calcular(List.of(habitacion)));
    }
}
