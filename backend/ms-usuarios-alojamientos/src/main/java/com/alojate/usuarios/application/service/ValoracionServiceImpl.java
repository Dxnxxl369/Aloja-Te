package com.alojate.usuarios.application.service;

import com.alojate.usuarios.domain.model.Valoracion;
import com.alojate.usuarios.domain.ports.in.ValoracionUseCase;
import com.alojate.usuarios.domain.ports.out.ValoracionRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ValoracionServiceImpl implements ValoracionUseCase {

    private final ValoracionRepositoryPort valoracionRepository;

    @Override
    @Transactional
    public Valoracion registrarValoracion(Valoracion valoracion) {
        if (valoracion.getPuntuacionGeneral() == null || valoracion.getPuntuacionGeneral() < 1 || valoracion.getPuntuacionGeneral() > 5) {
            throw new IllegalArgumentException("La puntuación general es obligatoria y debe ser entre 1 y 5 estrellas.");
        }
        if (valoracion.getComentario() == null || valoracion.getComentario().trim().isEmpty()) {
            throw new IllegalArgumentException("El comentario de la reseña no puede estar vacío.");
        }

        // Si los 5 atributos no se especificaron individualmente, se pueden autocompletar con la puntuación general
        if (valoracion.getCalificacionLimpieza() == null) {
            valoracion.setCalificacionLimpieza(valoracion.getPuntuacionGeneral());
        }
        if (valoracion.getCalificacionUbicacion() == null) {
            valoracion.setCalificacionUbicacion(valoracion.getPuntuacionGeneral());
        }
        if (valoracion.getCalificacionCalidadPrecio() == null) {
            valoracion.setCalificacionCalidadPrecio(valoracion.getPuntuacionGeneral());
        }
        if (valoracion.getCalificacionServicio() == null) {
            valoracion.setCalificacionServicio(valoracion.getPuntuacionGeneral());
        }
        if (valoracion.getCalificacionComodidad() == null) {
            valoracion.setCalificacionComodidad(valoracion.getPuntuacionGeneral());
        }

        if (valoracion.getFechaCreacion() == null) {
            valoracion.setFechaCreacion(LocalDateTime.now());
        }

        // Si no vino sentimiento desde NLP externo, inferir regla heurística base
        if (valoracion.getSentimientoNlp() == null) {
            if (valoracion.getPuntuacionGeneral() >= 4) {
                valoracion.setSentimientoNlp("POSITIVO");
                valoracion.setConfianzaNlp(new BigDecimal("0.9200"));
            } else if (valoracion.getPuntuacionGeneral() == 3) {
                valoracion.setSentimientoNlp("NEUTRO");
                valoracion.setConfianzaNlp(new BigDecimal("0.8500"));
            } else {
                valoracion.setSentimientoNlp("NEGATIVO");
                valoracion.setConfianzaNlp(new BigDecimal("0.9400"));
            }
        }

        log.info("[ValoracionService] Guardando reseña para alojamiento {} (Unidad: {})", 
                valoracion.getIdAlojamiento(), valoracion.getIdUnidad());
        return valoracionRepository.guardar(valoracion);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Valoracion> listarPorAlojamiento(UUID idAlojamiento) {
        return valoracionRepository.listarPorAlojamiento(idAlojamiento);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Valoracion> listarGeneralesHotel(UUID idAlojamiento) {
        return valoracionRepository.listarGeneralesHotel(idAlojamiento);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Valoracion> listarPorUnidad(UUID idUnidad) {
        return valoracionRepository.listarPorUnidad(idUnidad);
    }
}
