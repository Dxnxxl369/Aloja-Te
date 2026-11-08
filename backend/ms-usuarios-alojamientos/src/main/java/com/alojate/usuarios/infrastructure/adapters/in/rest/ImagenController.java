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
@RequestMapping("/api/v1/alojamientos/imagenes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ImagenController {

    private static final Set<String> TIPOS_PERMITIDOS = Set.of("image/jpeg", "image/png", "image/webp");
    private static final String CARPETA = "alojamientos";

    private final AlmacenImagenesPort almacenImagenes;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> subirImagen(@RequestParam("archivo") MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new ImagenInvalidaException("Debe adjuntar un archivo de imagen.");
        }
        String contentType = archivo.getContentType();
        if (contentType == null || !TIPOS_PERMITIDOS.contains(contentType.toLowerCase())) {
            throw new ImagenInvalidaException("Formato no permitido. Use JPG, PNG o WEBP.");
        }
        byte[] contenido;
        try {
            contenido = archivo.getBytes();
        } catch (IOException ex) {
            throw new ImagenInvalidaException("No se pudo leer el archivo enviado.");
        }
        if (!firmaCoincide(contentType.toLowerCase(), contenido)) {
            throw new ImagenInvalidaException("El contenido del archivo no corresponde a una imagen válida.");
        }
        String url = almacenImagenes.subir(CARPETA, contentType.toLowerCase(), contenido);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("url", url));
    }

    /** Verifica los primeros bytes (firma) para no confiar solo en el Content-Type que declara el cliente. */
    private boolean firmaCoincide(String contentType, byte[] b) {
        if (b.length < 12) return false;
        return switch (contentType) {
            case "image/jpeg" -> (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8;
            case "image/png" -> (b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G';
            case "image/webp" -> b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
                    && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P';
            default -> false;
        };
    }
}
