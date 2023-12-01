import { useCallback, useContext, useMemo } from 'react';

import { PluginsBundleContext } from '../contexts/PluginsBundleContext';
import type { IAnalyticsProvider } from '../plugins/types';

export function useAnalytics() {
  const { bundle } = useContext(PluginsBundleContext);

  const plugins = useMemo(() => {
    return bundle.plugins.filter((x) =>
      x.features.includes('Analytics'),
    ) as unknown[] as IAnalyticsProvider[];
  }, [bundle]);

  const logEvent: IAnalyticsProvider['logEvent'] = useCallback(
    async (...args) => {
      await Promise.all(
        plugins.map((plugin) => {
          plugin.logEvent(...args);
        }),
      );
    },
    [plugins],
  );

  return useMemo(
    () => ({
      logEvent,
    }),
    [logEvent],
  );
}
