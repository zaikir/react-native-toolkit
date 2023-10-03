import chalk from 'chalk';
import PQueue from 'p-queue';
import React, { useCallback, useRef, useState } from 'react';
import { Alert, Button, StatusBar, Text, View } from 'react-native';
import { useAsyncEffect } from 'use-async-effect';

import { AppSplashScreen } from 'components/AppSplashScreen';
import type { AppSplashScreenProps } from 'components/AppSplashScreen';
import { InAppPurchaseProvider } from 'contexts/InAppPurchaseContext/InAppPurchaseContext';
import { PluginsBundleProvider } from 'contexts/PluginsBundleContext/PluginsBundleContext';
import { ControlledPromise, scaleX, scaleY, timeout } from 'index';
import { Plugin, PluginFactoryOptions, PluginsBundle } from 'plugins/Plugin';

const chalkCtx = new chalk.Instance({ level: 3 });

type PluginDef =
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
      PluginFactoryOptions);

type Props = {
  children?: React.ReactNode;
  plugins?: PluginDef[];
  splashScreenProps?: Omit<AppSplashScreenProps, 'visible' | 'children'>;
};

export function AppBootstrapper({
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
  const initializedPlugins = useRef<Plugin[]>([]);
  const ErrorFallbackScreen = useRef<
    PluginFactoryOptions['fallbackScreen'] | null
  >(null);
  const currentPluginIndex = useRef(0);
  const isInitializedRef = useRef(false);

  const initialize = useCallback(async () => {
    if (!plugins) {
      return;
    }

    const initializePlugin = async (
      plugin: PluginDef,
      bundle: PluginsBundle,
      async: boolean,
    ) => {
      const initializationStartTime = new Date().valueOf();

      try {
        if ('useValue' in plugin) {
          await timeout(
            plugin.useValue.initialize(bundle),
            plugin.timeout === null
              ? null
              : plugin.timeout ?? plugin.useValue.initializationTimeout,
            `${plugin.useValue.name} timeout error`,
          );
          initializedPlugins.current.push(plugin.useValue);
        } else if ('useFactory' in plugin) {
          const initializedPlugin = await plugin.useFactory(bundle);

          if (initializedPlugin) {
            await timeout(
              initializedPlugin.initialize(bundle),
              plugin.timeout === null
                ? null
                : plugin.timeout ?? initializedPlugin.initializationTimeout,
              `${initializedPlugin.name} timeout error`,
            );
            initializedPlugins.current.push(initializedPlugin);
          }
        } else if ('useDeferredFactory' in plugin) {
          const promise = new ControlledPromise<void>();
          const pluginName = plugin.name ?? 'DeferredPlugin';

          const initializedPlugin = await timeout(
            plugin.useDeferredFactory(bundle, promise.resolve, promise.reject),
            plugin.timeout,
            `${pluginName} timeout error`,
          );

          const [, additionalData] = await timeout(
            Promise.all([
              initializedPlugin?.initialize(bundle),
              promise.wait(),
            ]),
            plugin.timeout === null
              ? null
              : plugin.timeout ?? initializedPlugin?.initializationTimeout,
            `${pluginName} timeout error`,
          );

          if (initializedPlugin) {
            initializedPlugin.payload = additionalData;
            initializedPlugins.current.push(initializedPlugin);
          }
        } else {
          initializedPlugins.current.push(plugin);
        }

        const lastPlugin =
          initializedPlugins.current[initializedPlugins.current.length - 1];

        console.info(
          [
            chalkCtx.yellow(`$[${lastPlugin.name}]`),
            chalkCtx.green(`${async ? 'Async plugin' : 'Plugin'} initialized`),
            chalkCtx.yellow(
              `+${(new Date().valueOf() - initializationStartTime).toFixed(
                0,
              )}ms`,
            ),
          ].join(' '),
        );
      } catch (err) {
        if (err) {
          const errorMessage =
            err instanceof Error ? err.message : (err as any).toString();

          if (errorMessage.includes('timeout error')) {
            const pluginName = errorMessage.replace(' timeout error', '');

            console.error(
              [
                chalkCtx.yellow(`$[${pluginName}]`),
                chalkCtx.red(
                  `${async ? 'Async plugin' : 'Plugin'} initialization timeout`,
                ),
                chalkCtx.yellow(
                  `+${(new Date().valueOf() - initializationStartTime).toFixed(
                    0,
                  )}ms`,
                ),
              ].join(' '),
            );
          }

          // eslint-disable-next-line @typescript-eslint/no-throw-literal
          throw err;
        }

        throw err;
      }
    };

    const asyncQueue = new PQueue({ concurrency: 1 });

    for (
      currentPluginIndex.current;
      currentPluginIndex.current < plugins.length;
      currentPluginIndex.current += 1
    ) {
      const plugin = plugins[currentPluginIndex.current];

      try {
        const bundle = new PluginsBundle(initializedPlugins.current);

        if ('async' in plugin && plugin.async) {
          asyncQueue.add(async () => {
            try {
              await initializePlugin(plugin, bundle, true);
            } catch {
              // no-op
            }

            if (isInitializedRef.current && !asyncQueue.size) {
              setPluginsBundle(new PluginsBundle(initializedPlugins.current));
            }
          });
          continue;
        }

        await initializePlugin(plugin, bundle, false);
      } catch (err) {
        if ('optional' in plugin && plugin.optional) {
          continue;
        }
        const errorMessage =
          err instanceof Error ? err.message : (err as any).toString();

        if (errorMessage.includes('timeout error')) {
          // no-op
        } else {
          console.error(errorMessage);
        }

        ErrorFallbackScreen.current =
          'fallbackScreen' in plugin ? plugin.fallbackScreen : null;
        setInitializationError(errorMessage);

        throw new Error(errorMessage);
      }
    }

    setPluginsBundle(new PluginsBundle(initializedPlugins.current));
    isInitializedRef.current = true;
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
    } catch {
      // no-op
    } finally {
      setIsInitialized(true);
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
        <StatusBar barStyle="dark-content" />
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
          <InAppPurchaseProvider>{children}</InAppPurchaseProvider>
        </PluginsBundleProvider>
      ) : (
        renderError()
      )}
    </AppSplashScreen>
  );
}
