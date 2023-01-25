import React, { createContext, PropsWithChildren, useMemo } from 'react';

import type { PluginFeature, InitializedPlugin } from 'plugins/Plugin';

export type PluginsBundleContextType = {
  plugins: InitializedPlugin[];
  features: Record<PluginFeature, InitializedPlugin[]>;
};

export const PluginsBundleContext = createContext<PluginsBundleContextType>(
  {} as any,
);

export function PluginsBundleProvider({
  children,
  plugins,
}: PropsWithChildren<{ plugins: InitializedPlugin[] }>) {
  const contextData = useMemo<PluginsBundleContextType>(
    () => ({
      plugins,
      features: plugins.reduce((acc, item) => {
        item.instance.features.forEach((feature) => {
          acc[feature] = acc[feature] || [];
          acc[feature].push(item);
        });

        return acc;
      }, {} as any),
    }),
    [plugins],
  );

  return (
    <PluginsBundleContext.Provider value={contextData}>
      {children}
    </PluginsBundleContext.Provider>
  );
}
