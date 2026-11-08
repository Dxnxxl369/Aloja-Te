package com.alojate.usuarios.application.service;

import com.alojate.usuarios.domain.model.Fotografia;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Resumen (SHA-256) del conjunto de fotos de un alojamiento: galería y habitaciones, con su orden.
 * Si el anfitrión agrega, quita, cambia o reordena una foto, la huella cambia.
 */
public final class HuellaFotos {

    private HuellaFotos() {
    }

    public static String calcular(List<Fotografia> fotos) {
        String canonico = fotos.stream()
                .sorted(Comparator
                        .comparing((Fotografia f) -> f.getIdUnidad() != null ? f.getIdUnidad().toString() : "")
                        .thenComparing(f -> f.getOrden() != null ? f.getOrden() : 0)
                        .thenComparing(f -> f.getUrl() != null ? f.getUrl() : ""))
                .map(f -> (f.getIdUnidad() != null ? f.getIdUnidad() : "-") + "|"
                        + (f.getOrden() != null ? f.getOrden() : 0) + "|"
                        + (f.getUrl() != null ? f.getUrl() : ""))
                .collect(Collectors.joining("\n"));
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(canonico.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 no disponible", e);
        }
    }
}
