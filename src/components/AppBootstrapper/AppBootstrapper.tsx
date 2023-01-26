import React, { useCallback, useRef, useState } from 'react';
import { Alert, Button, Text, View } from 'react-native';
import { hide as hideNativeSplash } from 'react-native-bootsplash';
import { useAsyncEffect } from 'use-async-effect';

import { AppSplashScreen } from 'components/AppSplashScreen';
import type { AppSplashScreenProps } from 'components/AppSplashScreen/AppSplashScreen';
import { PluginsBundleProvider } from 'contexts/PluginsBundleContext/PluginsBundleContext';
import { ControlledPromise, scaleX, scaleY } from 'index';
import { Plugin, PluginFactoryOptions, PluginsBundle } from 'plugins/Plugin';

type Props = {
  children?: React.ReactNode;
  plugins?: (
    | Plugin
    | ((
        | { useValue: Plugin }
        | {
            useFactory: (
              plugins: PluginsBundle,
            ) => Plugin | void | Promise<Plugin | void>;
          }
        | {
            useDeferredFactory: (
              plugins: PluginsBundle,
              resolve: (value: any | PromiseLike<any>) => void,
              reject: (reason?: any) => void,
            ) => Plugin | void | Promise<Plugin | void>;
          }
      ) &
        PluginFactoryOptions)
  )[];
  splashScreenProps?: Omit<AppSplashScreenProps, 'visible' | 'children'>;
};

export default function AppBootstrapper({
  children,
  plugins,
  splashScreenProps,
}: Props) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(
    null,
  );
  const [pluginsBundle, setPluginsBundle] = useState<PluginsBundle>(
    new PluginsBundle([]),
  );
  const ErrorFallbackScreen = useRef<
    PluginFactoryOptions['fallbackScreen'] | null
  >(null);
  const currentPluginIndex = useRef(0);

  const initialize = useCallback(async () => {
    if (!plugins) {
      return;
    }

    const initializedPlugins: Plugin[] = [];

    for (
      currentPluginIndex.current;
      currentPluginIndex.current < plugins.length;
      currentPluginIndex.current += 1
    ) {
      const plugin = plugins[currentPluginIndex.current];

      try {
        if ('useValue' in plugin) {
          await plugin.useValue.initialize();
          initializedPlugins.push(plugin.useValue);
        } else if ('useFactory' in plugin) {
          const initializedPlugin = await plugin.useFactory(
            new PluginsBundle(initializedPlugins),
          );

          if (initializedPlugin) {
            initializedPlugins.push(initializedPlugin);
          }
        } else if ('useDeferredFactory' in plugin) {
          const promise = new ControlledPromise<void>();
          const [initializedPlugin, additionalData] = await Promise.all([
            plugin.useDeferredFactory(
              new PluginsBundle(initializedPlugins),
              promise.resolve,
              promise.reject,
            ),
            promise.wait(),
          ]);

          if (initializedPlugin) {
            initializedPlugin.payload = additionalData;
            initializedPlugins.push(initializedPlugin);
          }
        } else {
          initializedPlugins.push(plugin);
        }
      } catch (err) {
        if ('optional' in plugin && plugin.optional) {
          continue;
        }
        const errorMessage =
          err instanceof Error ? err.message : (err as any).toString();

        ErrorFallbackScreen.current =
          'fallbackScreen' in plugin ? plugin.fallbackScreen : null;
        setInitializationError(errorMessage);

        console.error(errorMessage);
        throw new Error(errorMessage);
      }
    }

    setPluginsBundle(new PluginsBundle(initializedPlugins));
  }, [plugins]);

  const retryInitialization = useCallback(async () => {
    try {
      setIsRetrying(true);
      await initialize();

      setInitializationError(null);
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
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

    if (ErrorFallbackScreen.current) {
      return (
        <ErrorFallbackScreen.current
          error={initializationError}
          isRetrying={isRetrying}
          retry={retryInitialization}
        />
      );
    }

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text
          style={{
            fontSize: scaleX(20),
            marginBottom: scaleY(5),
          }}
        >
          {initializationError}
        </Text>
        <Button
          disabled={isRetrying}
          onPress={retryInitialization}
          title="Retry"
        />
      </View>
    );
  }, [
    initializationError,
    ErrorFallbackScreen,
    isRetrying,
    retryInitialization,
  ]);

  return (
    <AppSplashScreen visible={!isInitialized} {...splashScreenProps}>
      {!initializationError ? (
        <PluginsBundleProvider bundle={pluginsBundle}>
          {children}
        </PluginsBundleProvider>
      ) : (
        renderError()
      )}
    </AppSplashScreen>
  );
}
