package com.alojate.usuarios.infrastructure.scheduling;

import com.alojate.usuarios.application.service.RevisionAutomaticaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

/** Dispara periódicamente el ciclo de la revisión automática. Se desactiva con {@code moderacion.job.habilitado=false}. */
@Slf4j
@Configuration
@EnableScheduling
@RequiredArgsConstructor
@ConditionalOnProperty(name = "moderacion.job.habilitado", havingValue = "true", matchIfMissing = true)
public class RevisionAutomaticaScheduler {

    private final RevisionAutomaticaService revisionAutomatica;

    @Scheduled(fixedDelayString = "${moderacion.job.intervalo-ms:60000}",
               initialDelayString = "${moderacion.job.intervalo-ms:60000}")
    public void ejecutar() {
        try {
            revisionAutomatica.ejecutarCiclo();
        } catch (RuntimeException ex) {
            log.error("Falló el ciclo de revisión automática: {}", ex.getMessage(), ex);
        }
    }
}
