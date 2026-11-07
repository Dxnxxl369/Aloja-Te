// ======================================================================
// ARCHIVO: auth/modelos.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: El modelo de DOMINIO de la sesión (camelCase, lo que consume la app): quién es el usuario, su token y cuándo vence.
// PARA QUÉ SIRVE: Una sola definición de "Sesion" para toda la app.
// SIN ÉL: Cada pantalla armaría su propia idea de qué es una sesión.
// NO VA AQUÍ: La forma cruda del backend (LoginDto, en http/modelos.ts) ni funciones.
// ======================================================================

export interface Sesion {
  token: string;
  usuarioId: string; // = idCliente / idAnfitrion en MS-02 y MS-03
  nombre: string; // nombreCompleto de MS-01; MS-02 lo pide como nombreCliente
  email: string;
  rol: string; // CLIENTE | ANFITRION | ADMINISTRADOR
  expiraEn: number | null; // epoch ms; null si el token no trae `exp`
}
