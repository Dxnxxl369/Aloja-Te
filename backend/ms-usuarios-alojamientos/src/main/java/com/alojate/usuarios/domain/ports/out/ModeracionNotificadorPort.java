package com.alojate.usuarios.domain.ports.out;

import java.util.UUID;

/**
 * Avisa al servicio de moderación automática (workflow de n8n) que un alojamiento
 * debe ser evaluado. Debe lanzar {@code ModeracionNoDisponibleException} si el aviso no se pudo entregar.
 */
public interface ModeracionNotificadorPort {
    void solicitarModeracion(UUID idAlojamiento);
}
