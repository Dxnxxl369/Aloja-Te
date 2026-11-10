package com.alojate.usuarios.infrastructure.adapters.in.rest;

import com.alojate.usuarios.domain.exception.ImagenInvalidaException;
import com.alojate.usuarios.domain.ports.out.AlmacenImagenesPort;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

/**
 * Recibe una imagen, la guarda en S3 y devuelve su URL pública. Esa URL es la que luego se
 * registra con POST /api/v1/alojamientos/{id}/fotografias.
 */
@RestController
@RequestMapping({"/api/v1/alojamientos/imagenes", "/api/v1/imagenes"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ImagenController {

    private static final Set<String> TIPOS_PERMITIDOS = Set.of(
            "image/jpeg", "image/jpg", "image/pjpeg",
            "image/png", "image/x-png",
            "image/webp",
            "application/pdf"
    );
    private static final String CARPETA_DEFAULT = "alojamientos";

    private final AlmacenImagenesPort almacenImagenes;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> subirImagen(
            @RequestParam(value = "archivo", required = false) MultipartFile archivoParam,
            @RequestParam(value = "file", required = false) MultipartFile fileParam,
            @RequestParam(value = "carpeta", required = false) String carpeta) {
        MultipartFile archivo = archivoParam != null ? archivoParam : fileParam;
        if (archivo == null || archivo.isEmpty()) {
            throw new ImagenInvalidaException("Debe adjuntar un archivo de imagen o documento.");
        }
        String contentType = archivo.getContentType();
        if (contentType == null || !TIPOS_PERMITIDOS.contains(contentType.toLowerCase())) {
            throw new ImagenInvalidaException("Formato no permitido. Use JPG, PNG, WEBP o PDF.");
        }
        byte[] contenido;
        try {
            contenido = archivo.getBytes();
        } catch (IOException ex) {
            throw new ImagenInvalidaException("No se pudo leer el archivo enviado.");
        }
        if (!firmaCoincide(contentType.toLowerCase(), contenido)) {
            throw new ImagenInvalidaException("El contenido del archivo no corresponde a un archivo válido.");
        }
        String carpetaDestino = (carpeta != null && !carpeta.isBlank()) ? carpeta.trim() : CARPETA_DEFAULT;
        String url = almacenImagenes.subir(carpetaDestino, contentType.toLowerCase(), contenido);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("url", url));
    }

    /** Verifica los primeros bytes (firma) para no confiar solo en el Content-Type que declara el cliente. */
    private boolean firmaCoincide(String contentType, byte[] b) {
        if (b.length < 4) return false;
        return switch (contentType) {
            case "image/jpeg", "image/jpg", "image/pjpeg" -> (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8;
            case "image/png", "image/x-png" -> (b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G';
            case "image/webp" -> b.length >= 12 && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
                    && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P';
            case "application/pdf" -> b[0] == '%' && b[1] == 'P' && b[2] == 'D' && b[3] == 'F';
            default -> true;
        };
    }
}
