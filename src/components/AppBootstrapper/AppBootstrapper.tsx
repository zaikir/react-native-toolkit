import React, { useCallback, useRef, useState } from 'react';
import { Button, Text, View } from 'react-native';
import { hide as hideNativeSplash } from 'react-native-bootsplash';
import { useAsyncEffect } from 'use-async-effect';

import { AppSplashScreen } from 'components/AppSplashScreen';
import type { AppSplashScreenProps } from 'components/AppSplashScreen/AppSplashScreen';
import { PluginsBundleProvider } from 'contexts/PluginsBundleContext/PluginsBundleContext';
import { useAlerts } from 'hooks/useAlerts';
import { ControlledPromise } from 'index';
import type {
  InitializationError,
  InitializationOptions,
  InitializedPlugin,
  Plugin,
} from 'plugins/Plugin';

type Props = {
  children?: React.ReactNode;
  plugins?: (
    | Plugin
    | ((bundle: InitializedPlugin[], resolve: (data?: any) => void) => Plugin)
  )[];
  splashScreenProps?: Omit<AppSplashScreenProps, 'visible' | 'children'>;
};

export default function AppBootstrapper({
  children,
  plugins,
  splashScreenProps,
}: Props) {
  const { showAlert } = useAlerts();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [errorFallbackScreen, setErrorFallbackScreen] = useState<
    InitializationOptions['fallbackScreen'] | null
  >(null);
  const [initializationError, setInitializationError] =
    useState<InitializationError | null>(null);
  const [pluginsBundle, setPluginsBundle] = useState<InitializedPlugin[]>([]);

  const currentPluginIndex = useRef(0);

  const initialize = useCallback(async () => {
    if (!plugins) {
      return;
    }

    const currentPluginBundle: InitializedPlugin[] = [];

    for (
      currentPluginIndex.current;
      currentPluginIndex.current < plugins.length;
      currentPluginIndex.current += 1
    ) {
      const plugin = plugins[currentPluginIndex.current];

      let realPluginInstance: Plugin | null = null;

      // eslint-disable-next-line no-await-in-loop
      const result = await (() => {
        if (typeof plugin === 'function') {
          return new Promise<InitializedPlugin | InitializationError>(
            async (resolve, reject) => {
              const waitPromise = new ControlledPromise<
                InitializedPlugin | InitializationError
              >();

              const resolveManually = plugin.length > 1;

              const pluginInstance = plugin(
                currentPluginBundle,
                async (data) => {
                  const initializedPlugin = await waitPromise.wait();
                  if ('error' in initializedPlugin) {
                    resolve(initializedPlugin);
                    return;
                  }

                  resolve({
                    ...initializedPlugin,
                    data: {
                      ...initializedPlugin.data,
                      ...data,
                    },
                  });
                },
              );

              realPluginInstance = pluginInstance;

              try {
                const initializedPlugin = await pluginInstance.init(
                  currentPluginBundle,
                  currentPluginIndex.current,
                );

                waitPromise.resolve(initializedPlugin);

                if (resolveManually) {
                  resolve(initializedPlugin);
                }
              } catch (err) {
                reject(err);
              }
            },
          );
        }

        realPluginInstance = plugin;
        return plugin.init(currentPluginBundle, currentPluginIndex.current);
      })();

      if ('error' in result) {
        setInitializationError(result);
        setErrorFallbackScreen(realPluginInstance!.fallbackScreen);
        throw new Error(result.error);
      }

      currentPluginBundle.push(result);
    }

    setPluginsBundle(currentPluginBundle);
  }, [plugins]);

  const retryInitialization = useCallback(async () => {
    try {
      setIsRetrying(true);
      await initialize();

      setInitializationError(null);
    } catch (err) {
      showAlert('error', 'Error', (err as Error).message);
    } finally {
      setIsRetrying(false);
    }
  }, [initialize]);

  useAsyncEffect(async () => {
    try {
      await initialize();
    } catch (err) {
      console.error(err);
    } finally {
      setIsInitialized(true);
      hideNativeSplash();
    }
  }, []);

  const renderError = useCallback(() => {
    if (!initializationError) {
      return null;
    }

    if (errorFallbackScreen) {
      return typeof errorFallbackScreen === 'function'
        ? errorFallbackScreen({
            error: initializationError,
            isRetrying,
            retry: retryInitialization,
          })
        : errorFallbackScreen;
    }

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>{initializationError.error}</Text>
        <Button
          disabled={isRetrying}
          onPress={retryInitialization}
          title="Retry"
        />
      </View>
    );
  }, [
    initializationError,
    errorFallbackScreen,
    isRetrying,
    retryInitialization,
  ]);

  return (
    <AppSplashScreen visible={!isInitialized} {...splashScreenProps}>
      {!initializationError ? (
        <PluginsBundleProvider plugins={pluginsBundle}>
          {children}
        </PluginsBundleProvider>
      ) : (
        renderError()
      )}
    </AppSplashScreen>
  );
}
