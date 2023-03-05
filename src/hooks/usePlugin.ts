import { useContext } from 'react';

import { PluginsBundleContext } from 'contexts/PluginsBundleContext';

import type { Plugin } from '../plugins/Plugin';

export function usePlugin<T extends Plugin>(name: string) {
  const { bundle } = useContext(PluginsBundleContext);

  return bundle.get<T>(name);
}
