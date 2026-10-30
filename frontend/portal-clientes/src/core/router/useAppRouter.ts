import { useState, useEffect } from 'react';

export type RouteView = 'catalogo' | 'mis-viajes' | 'anfitrion' | 'detalle';

export interface RouteState {
  view: RouteView;
  params: {
    id?: string;
    depto?: string;
  };
  hash: string;
}

function getRawPath(): string {
  if (typeof window === 'undefined') return '';
  
  // Preferir hash si está disponible
  const hash = window.location.hash;
  if (hash && hash.length > 1) {
    return hash.replace(/^#\/?!?\/?/, '');
  }

  // Fallback a pathname si se accede directamente por path
  const pathname = window.location.pathname;
  if (pathname && pathname !== '/' && !pathname.startsWith('/admin')) {
    return pathname.replace(/^\/+/, '');
  }

  return '';
}

export function parseRoute(raw: string): RouteState {
  let path = raw;
  let queryString = '';

  const queryIndex = path.indexOf('?');
  if (queryIndex !== -1) {
    queryString = path.substring(queryIndex + 1);
    path = path.substring(0, queryIndex);
  }

  const searchParams = new URLSearchParams(queryString);
  const depto = searchParams.get('depto') || undefined;

  // Quitar barras finales
  path = path.replace(/\/+$/, '');

  if (!path || path === 'catalogo' || path === 'explore') {
    return {
      view: 'catalogo',
      params: { depto },
      hash: typeof window !== 'undefined' ? window.location.hash : ''
    };
  }

  if (path === 'mis-viajes' || path === 'viajes' || path === 'reservas') {
    return {
      view: 'mis-viajes',
      params: {},
      hash: typeof window !== 'undefined' ? window.location.hash : ''
    };
  }

  if (path === 'anfitrion' || path === 'host' || path === 'panel-anfitrion') {
    return {
      view: 'anfitrion',
      params: {},
      hash: typeof window !== 'undefined' ? window.location.hash : ''
    };
  }

  // Coincidencia con /alojamientos/:id o /alojamiento/:id o /detalle/:id
  const matchAlojamiento = path.match(/^(?:alojamientos|alojamiento|detalle)\/([^/?#]+)$/i);
  if (matchAlojamiento) {
    return {
      view: 'detalle',
      params: { id: matchAlojamiento[1], depto },
      hash: typeof window !== 'undefined' ? window.location.hash : ''
    };
  }

  return {
    view: 'catalogo',
    params: { depto },
    hash: typeof window !== 'undefined' ? window.location.hash : ''
  };
}

export const navigate = {
  catalogo: (depto?: string) => {
    const target = depto && depto !== 'Todos'
      ? `#/catalogo?depto=${encodeURIComponent(depto)}`
      : '#/';
    if (window.location.hash !== target) {
      window.location.hash = target;
    }
  },
  detalle: (id: string) => {
    const target = `#/alojamientos/${id}`;
    if (window.location.hash !== target) {
      window.location.hash = target;
    }
  },
  misViajes: () => {
    if (window.location.hash !== '#/mis-viajes') {
      window.location.hash = '#/mis-viajes';
    }
  },
  anfitrion: () => {
    if (window.location.hash !== '#/anfitrion') {
      window.location.hash = '#/anfitrion';
    }
  },
  back: () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.hash = '#/';
    }
  }
};

export function useAppRouter() {
  const [route, setRoute] = useState<RouteState>(() => parseRoute(getRawPath()));

  useEffect(() => {
    const handleNavigation = () => {
      const newRoute = parseRoute(getRawPath());
      setRoute(newRoute);
    };

    window.addEventListener('hashchange', handleNavigation);
    window.addEventListener('popstate', handleNavigation);

    return () => {
      window.removeEventListener('hashchange', handleNavigation);
      window.removeEventListener('popstate', handleNavigation);
    };
  }, []);

  return {
    route,
    currentView: route.view,
    params: route.params,
    navigate
  };
}
