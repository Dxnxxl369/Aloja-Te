import { httpClient } from './httpClient';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Sube una imagen al backend (que la guarda en S3) y devuelve su URL pública.
 * Lanza un Error con mensaje legible si el archivo no es válido o la subida falla.
 */
export async function subirImagen(archivo: File): Promise<string> {
  if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
    throw new Error(`"${archivo.name}": formato no permitido. Use JPG, PNG o WEBP.`);
  }
  if (archivo.size > MAX_BYTES) {
    throw new Error(`"${archivo.name}" supera el máximo de 10 MB.`);
  }
  const form = new FormData();
  form.append('archivo', archivo);
  try {
    const res = await httpClient.post<{ url: string }>('/api/v1/alojamientos/imagenes', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
    return res.data.url;
  } catch (e: any) {
    const mensaje = e?.response?.data?.mensaje || 'No se pudo subir la imagen. Intente nuevamente.';
    throw new Error(mensaje);
  }
}
