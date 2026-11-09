// ======================================================================
// ARCHIVO: cuenta/index.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: La puerta del feature cuenta (hoy solo la pantalla de login).
// PARA QUÉ SIRVE: Un único punto de entrada; la lógica del login vive en core/auth.
// SIN ÉL: La raíz de la app importaría archivos internos del feature.
// NO VA AQUÍ: Lógica de autenticación.
// ======================================================================

export { PantallaLogin } from './presentacion/pantallas/PantallaLogin';
export { PantallaPerfil } from './presentacion/pantallas/PantallaPerfil';
