import React, { createContext, PropsWithChildren, useMemo } from 'react';

import type { PluginsBundle } from 'plugins/Plugin';

export type PluginsBundleContextType = {
  bundle: PluginsBundle;
};

export const PluginsBundleContext = createContext<PluginsBundleContextType>(
  {} as any,
);

export function PluginsBundleProvider({
  children,
  bundle,
}: PropsWithChildren<{ bundle: PluginsBundle }>) {
  const contextData = useMemo<PluginsBundleContextType>(
    () => ({ bundle }),
    [bundle],
  );

  return (
    <PluginsBundleContext.Provider value={contextData}>
      {children}
    </PluginsBundleContext.Provider>
  );
}
