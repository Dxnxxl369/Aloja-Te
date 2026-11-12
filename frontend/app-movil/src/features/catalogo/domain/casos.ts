// ======================================================================
// ARCHIVO: catalogo/domain/casos.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: Las reglas del explorador: qué es "destacado", qué ciudades se ofrecen y cómo se filtra lo ya cargado.
// PARA QUÉ SIRVE: Que la pantalla solo pinte, y que estas reglas se puedan probar sin red ni React.
// SIN ÉL: La pantalla mezclaría filtros y ordenamientos con el diseño.
// NO VA AQUÍ: HTTP, SQLite ni React: solo recibe el repositorio por interfaz.
// ======================================================================

import { MAX_DESTACADOS } from '../constantes';
import type { CasosCatalogo, RepositorioCatalogo } from './interfaces';

/** Minúsculas y sin tildes, para que "Potosi" encuentre "Potosí". */
function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export function crearCasosCatalogo(deps: { repo: RepositorioCatalogo }): CasosCatalogo {
  const { repo } = deps;

  return {
    listarAlojamientos: (filtros) => repo.listar(filtros),
    listarTipos: () => repo.tipos(),
    obtenerDetalle: (id) => repo.detalle(id),
    obtenerValoraciones: (id) => (repo.obtenerValoraciones ? repo.obtenerValoraciones(id) : Promise.resolve([])),

    destacados(lista) {
      return lista
        .filter((a) => a.calificacion !== null && a.totalResenas > 0)
        .sort((a, b) => (b.calificacion as number) - (a.calificacion as number) || b.totalResenas - a.totalResenas)
        .slice(0, MAX_DESTACADOS);
    },

    ciudades(lista) {
      const cuenta = new Map<string, { nombre: string; n: number }>();
      for (const a of lista) {
        const nombre = a.ciudad.trim();
        if (!nombre) continue;
        const clave = normalizar(nombre);
        const actual = cuenta.get(clave);
        if (actual) actual.n += 1;
        else cuenta.set(clave, { nombre, n: 1 });
      }
      return [...cuenta.values()].sort((a, b) => b.n - a.n || a.nombre.localeCompare(b.nombre, 'es')).map((c) => c.nombre);
    },

    filtrar(lista, f) {
      const texto = normalizar(f.texto);
      const ciudad = f.ciudad ? normalizar(f.ciudad) : null;
      return lista.filter((a) => {
        if (ciudad && normalizar(a.ciudad) !== ciudad) return false;
        if (f.tipoId !== null && a.tipoId !== f.tipoId) return false;
        if (!texto) return true;
        const pajar = normalizar([a.titulo, a.ciudad, a.departamento, a.tipo].filter(Boolean).join(' '));
        return pajar.includes(texto);
      });
    },
  };
}
