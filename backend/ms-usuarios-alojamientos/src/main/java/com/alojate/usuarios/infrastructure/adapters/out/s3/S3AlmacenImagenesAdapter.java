package com.alojate.usuarios.infrastructure.adapters.out.s3;

import com.alojate.usuarios.domain.exception.AlmacenamientoNoDisponibleException;
import com.alojate.usuarios.domain.ports.out.AlmacenImagenesPort;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.core.exception.SdkException;

import java.util.Map;
import java.util.UUID;

/**
 * Sube las imágenes a un bucket de S3 con lectura pública (vía política del bucket, sin ACLs).
 * Las credenciales se resuelven con la cadena por defecto del SDK
 * (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY, perfil local o rol de IAM), por lo que el
 * servicio arranca aunque todavía no estén configuradas; fallará solo al intentar subir.
 */
@Slf4j
@Component
public class S3AlmacenImagenesAdapter implements AlmacenImagenesPort {

    private static final Map<String, String> EXTENSIONES = Map.of(
            "image/jpeg", "jpg",
            "image/png", "png",
            "image/webp", "webp"
    );

    private final S3Client s3Client;
    private final String bucket;
    private final String region;
    private final String publicBaseUrl;

    public S3AlmacenImagenesAdapter(
            @Value("${almacenamiento.s3.bucket:}") String bucket,
            @Value("${almacenamiento.s3.region:us-east-1}") String region,
            @Value("${almacenamiento.s3.public-base-url:}") String publicBaseUrl,
            @Value("${almacenamiento.s3.access-key:}") String accessKey,
            @Value("${almacenamiento.s3.secret-key:}") String secretKey) {
        this.bucket = bucket;
        this.region = region;
        this.publicBaseUrl = publicBaseUrl == null ? "" : publicBaseUrl.replaceAll("/+$", "");
        S3ClientBuilder builder = S3Client.builder().region(Region.of(region));
        if (!accessKey.isBlank() && !secretKey.isBlank()) {
            builder.credentialsProvider(StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(accessKey.trim(), secretKey.trim())));
        }
        this.s3Client = builder.build();
    }

    @Override
    public String subir(String carpeta, String contentType, byte[] contenido) {
        if (bucket == null || bucket.isBlank()) {
            throw new AlmacenamientoNoDisponibleException(
                    "El almacenamiento de imágenes no está configurado. Defina S3_BUCKET (y las credenciales de AWS).");
        }
        String extension = EXTENSIONES.getOrDefault(contentType, "bin");
        String key = carpeta + "/" + UUID.randomUUID() + "." + extension;
        try {
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucket)
                            .key(key)
                            .contentType(contentType)
                            .cacheControl("public, max-age=31536000, immutable")
                            .build(),
                    RequestBody.fromBytes(contenido));
        } catch (S3Exception ex) {
            log.error("S3 rechazó la subida ({}): {}", ex.statusCode(), ex.awsErrorDetails().errorMessage());
            throw new AlmacenamientoNoDisponibleException(
                    "No se pudo guardar la imagen en S3: " + ex.awsErrorDetails().errorMessage(), ex);
        } catch (SdkException ex) {
            log.error("No se pudo contactar a S3: {}", ex.getMessage());
            throw new AlmacenamientoNoDisponibleException(
                    "No se pudo contactar a S3. Verifique credenciales, región y conexión.", ex);
        }
        String url = construirUrl(key);
        log.info("Imagen subida a S3: {}", url);
        return url;
    }

    private String construirUrl(String key) {
        if (!publicBaseUrl.isEmpty()) {
            return publicBaseUrl + "/" + key;
        }
        return "https://" + bucket + ".s3." + region + ".amazonaws.com/" + key;
    }
}
