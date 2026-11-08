// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/ficha/texto.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Una función pequeña para unir textos de la ficha ("Santa Cruz de la Sierra · Santa Cruz").
// PARA QUÉ SIRVE: Que la ciudad y el departamento no salgan repetidos ni vacíos en ningún bloque de la ficha.
// SIN ÉL: Cada bloque repetiría la misma limpieza.
// NO VA AQUÍ: Diseño ni datos.
// ======================================================================

/** Quita lo repetido ("La Paz, La Paz") y lo vacío, y une con el separador. */
export function unir(partes: (string | undefined)[], separador: string): string {
  const limpias = partes.filter((p): p is string => !!p && p.trim().length > 0);
  return limpias.filter((p, i) => limpias.findIndex((q) => q.toLowerCase() === p.toLowerCase()) === i).join(separador);
}
