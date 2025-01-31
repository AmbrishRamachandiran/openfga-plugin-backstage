import {
  createPlugin,
  createRoutableExtension,
  createApiFactory,
  configApiRef,
  discoveryApiRef,
} from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';
import { OpenFgaClient } from './OpenFgaClient';
import { openFgaApiRef } from './openFgaApi';

export const openfgaPlugin = createPlugin({
  id: 'openfga',
  apis: [
    createApiFactory({
      api: openFgaApiRef,
      deps: {
        configApi: configApiRef,
        discoveryApi: discoveryApiRef,
      },
      factory: ({ configApi, discoveryApi }) =>
        OpenFgaClient.fromConfig(
          configApi,
          discoveryApi,
        ),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

export const OpenfgaPage = openfgaPlugin.provide(
  createRoutableExtension({
    name: 'OpenfgaPage',
    component: () =>
      import('./components/HeaderComponent').then(m => m.HeaderComponent),
    mountPoint: rootRouteRef,
  }),
);
