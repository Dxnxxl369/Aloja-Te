package com.alojate.usuarios.domain.ports.out;

/**
 * Puerto de salida para almacenar imágenes (S3 u otro proveedor).
 */
public interface AlmacenImagenesPort {

    /**
     * Guarda la imagen y devuelve la URL pública con la que se podrá leer.
     *
     * @param carpeta     prefijo lógico dentro del almacén (ej. "alojamientos")
     * @param contentType tipo MIME ya validado (image/jpeg, image/png, image/webp)
     * @param contenido   bytes de la imagen
     */
    String subir(String carpeta, String contentType, byte[] contenido);
}
