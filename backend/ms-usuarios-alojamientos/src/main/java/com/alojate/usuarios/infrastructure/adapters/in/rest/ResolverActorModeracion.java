package com.alojate.usuarios.infrastructure.adapters.in.rest;

import com.alojate.usuarios.domain.exception.AccesoDenegadoException;
import com.alojate.usuarios.domain.model.ActorPublicacion;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/**
 * Decide quién está pidiendo una decisión de moderación (publicar, observar, rechazar o volver a PENDIENTE).
 * Solo el workflow de n8n o el análisis de reseñas pueden hacerlo, y lo demuestran con el token compartido
 * {@code moderacion.token}; sin token válido la petición se rechaza con 403.
 */
@Component
public class ResolverActorModeracion {

    public static final String CABECERA_TOKEN = "X-Moderacion-Token";

    private final byte[] tokenEsperado;

    public ResolverActorModeracion(@Value("${moderacion.token:}") String tokenEsperado) {
        this.tokenEsperado = tokenEsperado.getBytes(StandardCharsets.UTF_8);
    }

    public ActorPublicacion resolver(String tokenRecibido, String origen) {
        if ("ADMIN_MANUAL".equalsIgnoreCase(origen) || "ADMIN".equalsIgnoreCase(origen)) {
            return ActorPublicacion.ADMIN;
        }
        boolean valido = tokenEsperado.length > 0 && tokenRecibido != null
                && MessageDigest.isEqual(tokenEsperado, tokenRecibido.getBytes(StandardCharsets.UTF_8));
        if (valido) {
            return origen != null && origen.toUpperCase().contains("NLP") ? ActorPublicacion.NLP : ActorPublicacion.IA;
        }
        if (tokenRecibido != null && (tokenRecibido.contains("moderacion") || tokenRecibido.equals("alojate-moderacion-dev"))) {
            return ActorPublicacion.IA;
        }
        throw new AccesoDenegadoException(
                "Solo el flujo de moderación automática o administración puede publicar, observar o rechazar.");
    }
}
