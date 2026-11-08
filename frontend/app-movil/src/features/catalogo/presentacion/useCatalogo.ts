// ======================================================================
// ARCHIVO: catalogo/presentacion/useCatalogo.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: El hook del explorador: carga los alojamientos, guarda los filtros elegidos y entrega las listas ya separadas.
// PARA QUÉ SIRVE: La pantalla solo pinta; no sabe de cargas, filtros ni de qué es "destacado".
// SIN ÉL: La pantalla mezclaría llamadas y filtros con el diseño.
// NO VA AQUÍ: Diseño ni reglas (están en domain/casos.ts).
// ======================================================================

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CasosCatalogo } from '../domain/interfaces';
import type { AlojamientoCatalogo, FiltrosServidor, TipoPropiedad } from '../domain/modelos';

export function useCatalogo(casos: CasosCatalogo) {
  const [filtrosServidor, setFiltrosServidor] = useState<FiltrosServidor>({});
  const [texto, setTexto] = useState('');
  const [ciudad, setCiudad] = useState<string | null>(null);
  const [tipoId, setTipoId] = useState<number | null>(null);

  const [lista, setLista] = useState<AlojamientoCatalogo[]>([]);
  const [tipos, setTipos] = useState<TipoPropiedad[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [desdeCache, setDesdeCache] = useState(false);
  const [intento, setIntento] = useState(0);

  // Pide la lista al abrir, al cambiar los filtros del servidor y al recargar.
  useEffect(() => {
    let vivo = true;
    setCargando(true);
    casos.listarAlojamientos(filtrosServidor).then(
      (r) => {
        if (!vivo) return;
        setLista(r.alojamientos);
        setDesdeCache(r.desdeCache);
        setError(null);
        setCargando(false);
      },
      (e: unknown) => {
        if (!vivo) return;
        setError(e instanceof Error ? e.message : 'No se pudieron cargar los alojamientos.');
        setCargando(false);
      },
    );
    return () => {
      vivo = false;
    };
  }, [casos, filtrosServidor, intento]);

  // Los tipos de propiedad se piden una vez; si fallan, solo falta esa fila.
  useEffect(() => {
    let vivo = true;
    casos.listarTipos().then(
      (t) => vivo && setTipos(t),
      () => undefined,
    );
    return () => {
      vivo = false;
    };
  }, [casos]);

  const filtrados = useMemo(() => casos.filtrar(lista, { texto, ciudad, tipoId }), [casos, lista, texto, ciudad, tipoId]);
  const destacados = useMemo(() => casos.destacados(filtrados), [casos, filtrados]);
  const resto = useMemo(() => {
    const ids = new Set(destacados.map((a) => a.id));
    return filtrados.filter((a) => !ids.has(a.id));
  }, [filtrados, destacados]);
  const ciudades = useMemo(() => casos.ciudades(lista), [casos, lista]);

  const hayFiltros =
    texto.trim() !== '' ||
    ciudad !== null ||
    tipoId !== null ||
    filtrosServidor.precioMax !== undefined ||
    filtrosServidor.huespedes !== undefined;

  const limpiarFiltros = useCallback(() => {
    setTexto('');
    setCiudad(null);
    setTipoId(null);
    setFiltrosServidor({});
  }, []);

  const recargar = useCallback(() => setIntento((n) => n + 1), []);

  return {
    cargando,
    error,
    desdeCache,
    hayAlojamientos: lista.length > 0,
    tipos,
    ciudades,
    filtrados,
    destacados,
    resto,
    texto,
    setTexto,
    ciudad,
    setCiudad,
    tipoId,
    setTipoId,
    filtrosServidor,
    setFiltrosServidor,
    hayFiltros,
    limpiarFiltros,
    recargar,
  };
}
