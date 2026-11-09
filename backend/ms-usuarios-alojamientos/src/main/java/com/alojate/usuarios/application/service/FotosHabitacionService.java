package com.alojate.usuarios.application.service;

import com.alojate.usuarios.domain.exception.ImagenInvalidaException;
import com.alojate.usuarios.domain.model.Fotografia;
import com.alojate.usuarios.domain.model.UnidadReservable;
import com.alojate.usuarios.domain.ports.out.FotografiaRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Guarda las fotos propias de una habitación (tabla fotografias con id_unidad).
 * Las fotos de habitación pertenecen siempre al mismo alojamiento que la habitación, de modo que el
 * flujo de moderación (que consulta por alojamiento) las revise junto con la galería del hotel.
 */
@Component
@RequiredArgsConstructor
public class FotosHabitacionService {

    private static final int MAX_URL = 500;

    private final FotografiaRepositoryPort fotografiaRepository;

    /**
     * Reemplaza las fotos de la habitación por la lista indicada (en el orden recibido; la primera es la portada).
     * Debe invocarse dentro de una transacción. Devuelve las fotos guardadas.
     */
    public List<Fotografia> reemplazar(UnidadReservable unidad, List<Fotografia> nuevas) {
        List<Fotografia> validas = validar(unidad, nuevas);

        fotografiaRepository.eliminarPorUnidad(unidad.getIdUnidad());

        List<Fotografia> guardadas = new ArrayList<>();
        int orden = 1;
        for (Fotografia f : validas) {
            Fotografia guardada = fotografiaRepository.guardar(Fotografia.builder()
                    .idAlojamiento(unidad.getIdAlojamiento()) // siempre el alojamiento de la habitación
                    .idUnidad(unidad.getIdUnidad())
                    .url(f.getUrl().trim())
                    .orden(orden++)
                    .build());
            guardada.setNombreUnidad(unidad.getNombre());
            guardadas.add(guardada);
        }
        return guardadas;
    }

    public void eliminarDeHabitacion(java.util.UUID idUnidad) {
        fotografiaRepository.eliminarPorUnidad(idUnidad);
    }

    /** Rechaza enlaces que no se puedan guardar (así ninguna foto escapa de la moderación sin avisar). */
    private List<Fotografia> validar(UnidadReservable unidad, List<Fotografia> fotos) {
        if (fotos == null) return List.of();

        List<Fotografia> ordenadas = new ArrayList<>(fotos);
        // Orden estable: respeta "orden" si viene; si no, el orden de llegada.
        ordenadas.sort(Comparator.comparing(f -> f.getOrden() != null ? f.getOrden() : Integer.MAX_VALUE));

        List<Fotografia> validas = new ArrayList<>();
        int n = 0;
        for (Fotografia f : ordenadas) {
            n++;
            String url = f.getUrl() != null ? f.getUrl().trim() : "";
            if (url.isEmpty()) continue;
            String lower = url.toLowerCase();
            if (!(lower.startsWith("http://") || lower.startsWith("https://")) || url.length() > MAX_URL) {
                throw new ImagenInvalidaException("La foto " + n + " de la habitación \"" + unidad.getNombre()
                        + "\" no es un enlace de imagen válido (debe ser http/https y de máximo " + MAX_URL
                        + " caracteres). Sube la imagen desde el equipo o pega su URL.");
            }
            validas.add(f);
        }
        return validas;
    }
}
