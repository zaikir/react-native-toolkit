import type { Plugin } from 'plugins/Plugin';
import React, { useCallback, useState } from 'react';
import { hide as hideNativeSplash } from 'react-native-bootsplash';
import useAsyncEffect from 'use-async-effect';
import { AppSplashScreen } from 'components/AppSplashScreen';
import type { AppSplashScreenProps } from 'components/AppSplashScreen/AppSplashScreen';

type Props = {
  children?: React.ReactNode,
  plugins?: Plugin[],
  splashScreenProps?: Omit<AppSplashScreenProps, 'visible' | 'children'>
};

export default function AppBootstrapper({ children, plugins, splashScreenProps }: Props) {
  const [isInitialized, setIsInitialized] = useState(false);

  const initialize = useCallback(async () => {
    if (!plugins) {
      return;
    }

    for (let i = 0; i < plugins.length; i += 1) {
      const plugin = plugins[i];

      // eslint-disable-next-line no-await-in-loop
      await plugin.init();
    }
  }, [plugins]);

  useAsyncEffect(async (isMounted) => {
    await initialize();
    if (!isMounted()) return;

    setIsInitialized(true);
    hideNativeSplash();
  }, []);

  return (
    <AppSplashScreen visible={!isInitialized} {...splashScreenProps}>
      {children}
    </AppSplashScreen>
  );
}
