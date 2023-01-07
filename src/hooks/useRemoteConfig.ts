import { PluginsBundleContext } from 'contexts/PluginsBundleContext';
import type { RemoteConfig } from 'plugins/types';
import { useContext } from 'react';

export default function useRemoteConfig() {
  const { features } = useContext(PluginsBundleContext);
  if (!features.RemoteConfig) {
    throw new Error('None of RemoteConfig plugins were initialized');
  }

  const parameters = Object.assign(
    {},
    ...features.RemoteConfig.map((x) => x.data.remoteConfig),
  ) as RemoteConfig;

  return parameters;
}
