import React, { createContext, PropsWithChildren, useMemo } from 'react';

import type { PluginsBundle } from 'plugins/Plugin';

export type PluginsBundleContextType = {
  bundle: PluginsBundle;
  retryInitialization: () => Promise<void>;
};

export const PluginsBundleContext = createContext<PluginsBundleContextType>(
  {} as any,
);

export function PluginsBundleProvider({
  children,
  bundle,
  retryInitialization,
}: PropsWithChildren<{
  bundle: PluginsBundle;
  retryInitialization: () => Promise<void>;
}>) {
  const contextData = useMemo<PluginsBundleContextType>(
    () => ({ bundle, retryInitialization }),
    [bundle, retryInitialization],
  );

  return (
    <PluginsBundleContext.Provider value={contextData}>
      {children}
    </PluginsBundleContext.Provider>
  );
}
