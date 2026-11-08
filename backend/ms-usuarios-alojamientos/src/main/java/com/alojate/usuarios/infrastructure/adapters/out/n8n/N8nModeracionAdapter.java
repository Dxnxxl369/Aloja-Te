package com.alojate.usuarios.infrastructure.adapters.out.n8n;

import com.alojate.usuarios.domain.exception.ModeracionNoDisponibleException;
import com.alojate.usuarios.domain.ports.out.ModeracionNotificadorPort;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Map;
import java.util.UUID;

/**
 * Llama al webhook del workflow de n8n. El workflow responde de inmediato ("Respond immediately")
 * y sigue trabajando por detrás, así que esta llamada nunca espera el análisis de las imágenes.
 */
@Slf4j
@Component
public class N8nModeracionAdapter implements ModeracionNotificadorPort {

    private final RestClient restClient;
    private final String webhookUrl;

    public N8nModeracionAdapter(
            @Value("${moderacion.n8n.webhook-url:http://localhost:5678/webhook/moderar-alojamiento}") String webhookUrl,
            @Value("${moderacion.n8n.timeout-ms:10000}") int timeoutMs) {
        this.webhookUrl = webhookUrl;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3000);
        factory.setReadTimeout(timeoutMs);
        this.restClient = RestClient.builder().requestFactory(factory).build();
    }

    @Override
    public void solicitarModeracion(UUID idAlojamiento) {
        try {
            restClient.post()
                    .uri(webhookUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("idAlojamiento", idAlojamiento.toString()))
                    .retrieve()
                    .toBodilessEntity();
            log.info("Moderación solicitada a n8n para el alojamiento {}", idAlojamiento);
        } catch (RestClientException ex) {
            log.warn("No se pudo avisar a n8n ({}): {}", webhookUrl, ex.getMessage());
            throw new ModeracionNoDisponibleException(
                    "No se pudo contactar al servicio de moderación automática (n8n). "
                            + "Verifique que n8n esté encendido y el workflow activo.", ex);
        }
    }
}
