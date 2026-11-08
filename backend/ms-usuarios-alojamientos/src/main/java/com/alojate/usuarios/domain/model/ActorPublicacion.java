package com.alojate.usuarios.domain.model;

/** Quién provoca un cambio en el estado de publicación de un alojamiento. */
public enum ActorPublicacion {
    /** El propio sistema: disparo automático, reintentos y vigilante de tiempo agotado. */
    SISTEMA,
    /** El workflow de moderación (n8n + LlavaGuard). */
    IA,
    /** El anfitrión dueño del anuncio. */
    ANFITRION,
    /** Un administrador del portal. */
    ADMIN,
    /** El análisis de reseñas (NLP) sobre anuncios ya publicados. */
    NLP
}
