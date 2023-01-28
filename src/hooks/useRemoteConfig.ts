import { useContext } from 'react';

import { PluginsBundleContext } from 'contexts/PluginsBundleContext';
import type { IRemoteConfigPlugin, RemoteConfig } from 'plugins/types';

export function useRemoteConfig() {
  const { bundle } = useContext(PluginsBundleContext);
  const remoteConfigPlugin =
    bundle.getByFeature<IRemoteConfigPlugin>('RemoteConfig');

  if (!remoteConfigPlugin) {
    throw new Error('None of RemoteConfig plugins were initialized');
  }

  const parameters = Object.assign(
    remoteConfigPlugin.remoteValues,
  ) as RemoteConfig;

  return parameters;
}
