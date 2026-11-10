package com.alojate.usuarios.infrastructure.adapters.out.supabase;

import com.alojate.usuarios.domain.exception.AlmacenamientoNoDisponibleException;
import com.alojate.usuarios.domain.ports.out.AlmacenImagenesPort;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;

/**
 * Almacena imágenes directamente en Supabase Storage REST API con visibilidad pública.
 * Cuando se migre a AWS S3, solo se cambia ALMACENAMIENTO_PROVEEDOR=s3 en el .env.
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "almacenamiento.proveedor", havingValue = "supabase", matchIfMissing = true)
public class SupabaseAlmacenImagenesAdapter implements AlmacenImagenesPort {

    private static final Map<String, String> EXTENSIONES = Map.of(
            "image/jpeg", "jpg",
            "image/jpg", "jpg",
            "image/pjpeg", "jpg",
            "image/png", "png",
            "image/x-png", "png",
            "image/webp", "webp",
            "application/pdf", "pdf"
    );

    private final HttpClient httpClient;
    private final String supabaseUrl;
    private final String supabaseKey;
    private final String bucket;

    public SupabaseAlmacenImagenesAdapter(
            @Value("${almacenamiento.supabase.url:}") String supabaseUrl,
            @Value("${almacenamiento.supabase.key:}") String supabaseKey,
            @Value("${almacenamiento.supabase.bucket:Aloja-te}") String bucket) {
        this.supabaseUrl = supabaseUrl == null ? "" : supabaseUrl.replaceAll("/+$", "");
        this.supabaseKey = supabaseKey == null ? "" : supabaseKey.trim();
        this.bucket = bucket == null ? "" : bucket.trim();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    @Override
    public String subir(String carpeta, String contentType, byte[] contenido) {
        if (supabaseUrl.isBlank() || supabaseKey.isBlank() || bucket.isBlank()) {
            throw new AlmacenamientoNoDisponibleException(
                    "El almacenamiento en Supabase no está configurado (faltan SUPABASE_URL, SUPABASE_KEY o SUPABASE_BUCKET).");
        }
        String extension = EXTENSIONES.getOrDefault(contentType, "jpg");
        String carpetaLimpia = (carpeta == null || carpeta.isBlank()) ? "alojamientos" : carpeta.trim().replaceAll("[^a-zA-Z0-9_-]", "");
        String key = carpetaLimpia + "/" + UUID.randomUUID() + "." + extension;
        String endpoint = supabaseUrl + "/storage/v1/object/" + bucket + "/" + key;

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .header("Authorization", "Bearer " + supabaseKey)
                    .header("apikey", supabaseKey)
                    .header("Content-Type", contentType)
                    .POST(HttpRequest.BodyPublishers.ofByteArray(contenido))
                    .timeout(Duration.ofSeconds(20))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                String publicUrl = supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + key;
                log.info("Imagen guardada exitosamente en Supabase: {}", publicUrl);
                return publicUrl;
            } else {
                log.error("Supabase Storage rechazó la subida (código {}): {}", response.statusCode(), response.body());
                throw new AlmacenamientoNoDisponibleException(
                        "Supabase Storage rechazó la subida (código " + response.statusCode() + "): " + response.body());
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new AlmacenamientoNoDisponibleException("Subida interrumpida: " + e.getMessage(), e);
        } catch (AlmacenamientoNoDisponibleException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error al contactar a Supabase Storage: {}", e.getMessage());
            throw new AlmacenamientoNoDisponibleException(
                    "Error al contactar a Supabase Storage: " + e.getMessage(), e);
        }
    }
}
