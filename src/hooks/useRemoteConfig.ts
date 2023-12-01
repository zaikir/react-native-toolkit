import { useContext } from 'react';

import { PluginsBundleContext } from '../contexts/PluginsBundleContext';
import type { IRemoteConfigPlugin, RemoteConfig } from '../plugins/types';

export function useRemoteConfig() {
  const { bundle } = useContext(PluginsBundleContext);

  const remoteConfigPlugins = bundle.plugins.filter((x) =>
    x.features.includes('RemoteConfig'),
  ) as unknown as IRemoteConfigPlugin[];

  return Object.assign(
    {},
    ...remoteConfigPlugins.map((x) => x.remoteValues),
  ) as RemoteConfig;
}
