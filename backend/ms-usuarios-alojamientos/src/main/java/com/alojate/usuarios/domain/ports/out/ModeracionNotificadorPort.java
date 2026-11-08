package com.alojate.usuarios.domain.ports.out;

import java.util.UUID;

/**
 * Avisa al servicio de moderación automática (workflow de n8n) que un alojamiento
 * debe ser evaluado. Debe lanzar {@code ModeracionNoDisponibleException} si el aviso no se pudo entregar.
 */
public interface ModeracionNotificadorPort {
    /**
     * @param idRevision identifica este intento; el workflow debe devolverlo al informar su resultado
     *                   para que MS-01 pueda descartar resultados de revisiones anteriores.
     */
    void solicitarModeracion(UUID idAlojamiento, UUID idRevision);
}
