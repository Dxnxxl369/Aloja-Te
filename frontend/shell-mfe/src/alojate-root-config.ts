import { registerApplication, start } from 'single-spa';

// Registro de Microfrontends de Aloja-Te
registerApplication({
  name: '@alojate/portal-clientes',
  app: () => (window as any).System.import('@alojate/portal-clientes'),
  activeWhen: (location) => !location.pathname.startsWith('/admin')
});

registerApplication({
  name: '@alojate/portal-admin',
  app: () => (window as any).System.import('@alojate/portal-admin'),
  activeWhen: ['/admin']
});

start({
  urlRerouteOnly: true,
});
