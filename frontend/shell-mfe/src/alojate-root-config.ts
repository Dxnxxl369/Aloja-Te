import { registerApplication, start } from 'single-spa';

// Registro de los 3 Microfrontends Oficiales de Aloja-Te:
// 1. Portal de Clientes (Puerto 3000)
registerApplication({
  name: '@alojate/portal-clientes',
  app: () => (window as any).System.import('@alojate/portal-clientes'),
  activeWhen: (location) => !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/anfitrion')
});

// 2. Portal de Auditoría Administrativa (Angular, Puerto 4200)
registerApplication({
  name: '@alojate/portal-admin',
  app: () => (window as any).System.import('@alojate/portal-admin'),
  activeWhen: ['/admin']
});

// 3. Portal de Anfitriones y Gestión Hotelera (React + Vite, Puerto 3005)
registerApplication({
  name: '@alojate/portal-anfitrion',
  app: () => (window as any).System.import('@alojate/portal-anfitrion'),
  activeWhen: ['/anfitrion']
});

start({
  urlRerouteOnly: true,
});
