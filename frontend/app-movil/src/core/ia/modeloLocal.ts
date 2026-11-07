// ======================================================================
// ARCHIVO: ia/modeloLocal.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: El administrador del modelo de IA que corre dentro del celular.
// PARA QUÉ SIRVE: Lo descarga, comprueba que no esté dañado, lo carga solo cuando se usa y lo libera. Avisa si el celular no lo soporta (punto 5).
// SIN ÉL: La app funciona igual; se pierde la IA sin internet y ese punto del parcial.
// NO VA AQUÍ: El motor de IA concreto: se conecta en di/composicion.ts.
// ======================================================================
// IA local en el celular: ciclo de vida del modelo.
//   NO_SOPORTADO | NO_DESCARGADO -> DESCARGANDO -> LISTO -> CARGADO
//
// El motor concreto (llama.rn, en ia/runtimeLlama.ts) entra por la interfaz
// RuntimeIA. Aquí NO se importa la librería. El motor nativo requiere
// development build (no corre en Expo Go) y la New Architecture de React Native.
// Nota: desde Expo SDK 54 esta API de expo-file-system se importa desde 'expo-file-system/legacy'
// (el módulo principal trae una API nueva). El proyecto usa SDK 58.

import * as Device from 'expo-device';
import * as FileSystem from 'expo-file-system/legacy';
import { AppError } from '../base/modelos';
import { crearStore } from '../base/store';
import type { ModeloLocal, RuntimeIA } from './interfaces';
import type { EstadoModelo, ModeloCatalogo } from './modelos';

export function crearModeloLocal(deps: {
  modelo: ModeloCatalogo;
  runtime: RuntimeIA;
  habilitado: boolean;
}): ModeloLocal {
  const { modelo, runtime, habilitado } = deps;
  const ruta = `${FileSystem.documentDirectory ?? ''}modelos/${modelo.archivo}`;
  const store = crearStore<{ estado: EstadoModelo }>({ estado: 'NO_DESCARGADO' });
  const actual = () => store.get().estado;
  const poner = (estado: EstadoModelo) => store.set({ estado });

  /** ¿Este celular aguanta el modelo? Conservador: si no se sabe la RAM, no. */
  async function puedeUsar(): Promise<boolean> {
    if (!habilitado) return false;
    const ram = Device.totalMemory;
    if (ram === null || ram < modelo.ramMinimaBytes) return false;
    const libre = await FileSystem.getFreeDiskStorageAsync();
    return libre > modelo.tamanoBytes * 1.5;
  }

  async function esValido(): Promise<boolean> {
    const info = await FileSystem.getInfoAsync(ruta, { md5: true });
    if (!info.exists) return false;
    return modelo.md5 === '' || info.md5 === modelo.md5;
  }

  return {
    estado: actual,
    store: { get: store.get, suscribir: store.suscribir },
    puedeUsar,

    async refrescar() {
      if (!(await puedeUsar())) poner('NO_SOPORTADO');
      else if (actual() !== 'CARGADO') poner((await esValido()) ? 'LISTO' : 'NO_DESCARGADO');
      return actual();
    },

    async descargar(onProgreso) {
      if (!(await puedeUsar())) {
        poner('NO_SOPORTADO');
        throw new AppError('DESCONOCIDO', 'Este dispositivo no soporta el modelo local');
      }
      poner('DESCARGANDO');
      try {
        await FileSystem.makeDirectoryAsync(ruta.replace(/\/[^/]+$/, ''), { intermediates: true });
        const descarga = FileSystem.createDownloadResumable(modelo.url, ruta, {}, (p) =>
          onProgreso?.(p.totalBytesExpectedToWrite ? p.totalBytesWritten / p.totalBytesExpectedToWrite : 0),
        );
        await descarga.downloadAsync();
        if (!(await esValido())) {
          await FileSystem.deleteAsync(ruta, { idempotent: true }); // archivo corrupto
          throw new AppError('DESCONOCIDO', 'El modelo descargado está corrupto');
        }
        poner('LISTO');
      } catch (e) {
        poner('ERROR');
        throw e;
      }
    },

    async cargar() {
      if (actual() === 'CARGADO') return;
      if (actual() !== 'LISTO') throw new AppError('DESCONOCIDO', `Modelo no disponible (${actual()})`);
      await runtime.cargar(ruta);
      poner('CARGADO');
      console.log('Modelo local cargado', modelo.id);
    },

    async generar(prompt, opciones) {
      if (actual() !== 'CARGADO') throw new AppError('DESCONOCIDO', 'El modelo no está cargado');
      return runtime.generar(prompt, opciones);
    },

    async liberar() {
      if (actual() !== 'CARGADO') return;
      await runtime.liberar();
      poner('LISTO');
    },
  };
}
