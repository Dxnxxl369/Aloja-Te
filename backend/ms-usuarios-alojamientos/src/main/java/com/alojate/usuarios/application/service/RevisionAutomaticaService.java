package com.alojate.usuarios.application.service;

import com.alojate.usuarios.domain.model.Alojamiento;
import com.alojate.usuarios.domain.model.EstadoPublicacion;
import com.alojate.usuarios.domain.ports.in.AlojamientoUseCase;
import com.alojate.usuarios.domain.ports.out.AlojamientoRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Ciclo periódico de la revisión automática (lo ejecuta {@code RevisionAutomaticaScheduler}):
 * <ol>
 *   <li>Vigilante: devuelve a PENDIENTE las revisiones EN_REVISION que superaron su tiempo límite.</li>
 *   <li>Cola: envía a revisión los PENDIENTE que ya les toca (registros que el portal no disparó y reintentos
 *       con espera cumplida), de a uno y mientras haya cupo en el workflow.</li>
 * </ol>
 * Los cambios de estado los hace {@link AlojamientoUseCase}, por lo que pasan por la máquina de estados.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RevisionAutomaticaService {

    private final AlojamientoRepositoryPort alojamientoRepository;
    private final AlojamientoUseCase alojamientoUseCase;
    private final PoliticaRevision politica;

    public void ejecutarCiclo() {
        LocalDateTime ahora = LocalDateTime.now();
        vencerRevisionesSinRespuesta(ahora);
        despacharPendientes(ahora);
    }

    private void vencerRevisionesSinRespuesta(LocalDateTime ahora) {
        for (Alojamiento a : alojamientoRepository.listarPorEstado(EstadoPublicacion.EN_REVISION)) {
            if (!politica.revisionVencida(a, ahora)) {
                continue;
            }
            try {
                log.warn("Revisión sin respuesta del alojamiento {} (límite {} min): vuelve a PENDIENTE",
                        a.getIdAlojamiento(), politica.limiteEnRevision(a).toMinutes());
                alojamientoUseCase.vencerRevision(a.getIdAlojamiento());
            } catch (RuntimeException ex) {
                log.error("No se pudo vencer la revisión del alojamiento {}: {}", a.getIdAlojamiento(), ex.getMessage());
            }
        }
    }

    private void despacharPendientes(LocalDateTime ahora) {
        List<Alojamiento> cola = alojamientoRepository.listarPorEstado(EstadoPublicacion.PENDIENTE).stream()
                .filter(a -> politica.puedeDespacharse(a, ahora))
                .sorted(Comparator.comparing(Alojamiento::fechaReferenciaEstado))
                .collect(Collectors.toList());

        for (Alojamiento a : cola) {
            if (alojamientoRepository.contarPorEstado(EstadoPublicacion.EN_REVISION) >= politica.getCupoConcurrente()) {
                log.debug("Sin cupo de revisión: quedan {} alojamientos en cola", cola.size());
                return;
            }
            try {
                alojamientoUseCase.enviarARevision(a.getIdAlojamiento());
            } catch (RuntimeException ex) {
                log.error("No se pudo enviar a revisión el alojamiento {}: {}", a.getIdAlojamiento(), ex.getMessage());
            }
        }
    }
}
