package com.alojate.usuarios.domain.model;

/** Eventos que pueden mover un alojamiento entre estados (ver {@link MaquinaEstadosPublicacion}). */
public enum EventoPublicacion {
    /** Registro completo o reintento automático: PENDIENTE pasa a revisión. */
    DISPARAR_REVISION(true),
    /** El admin reintenta una revisión que agotó sus intentos. */
    REINTENTAR_ADMIN(true),
    /** El anfitrión corrige un anuncio observado y lo reenvía. */
    REENVIAR_ANFITRION(true),

    IA_PUBLICA(false),
    IA_OBSERVA(false),
    IA_RECHAZA(false),
    /** Fallo técnico o tiempo agotado: vuelve a PENDIENTE y suma un intento. */
    ERROR_TECNICO(false),

    NLP_OBSERVA(false),
    SUSPENDER(false),
    REACTIVAR(false);

    private final boolean iniciaRevision;

    EventoPublicacion(boolean iniciaRevision) {
        this.iniciaRevision = iniciaRevision;
    }

    /** true si el evento lleva el alojamiento a EN_REVISION (y por tanto debe avisar al workflow). */
    public boolean iniciaRevision() {
        return iniciaRevision;
    }
}
