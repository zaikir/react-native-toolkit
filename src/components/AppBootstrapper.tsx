import { PortalHost } from '@gorhom/portal';
import chalk from 'chalk';
import PQueue from 'p-queue';
import React, { useCallback, useRef, useState } from 'react';
import { Alert, Button, StatusBar, Text, View } from 'react-native';
import { useAsyncEffect } from 'use-async-effect';

import type { AppSplashScreenProps } from '../components/AppSplashScreen';
import { AppSplashScreen } from '../components/AppSplashScreen';
import { DropDownProvider } from '../contexts/DropDownContext';
import { InAppPurchaseProvider } from '../contexts/InAppPurchaseContext';
import { PluginsBundleProvider } from '../contexts/PluginsBundleContext';
import {
  AlertsProvider,
  ControlledPromise,
  PromiseUtils,
  scaleX,
  scaleY,
  timeout,
} from '../index';
import { Plugin, PluginFactoryOptions, PluginsBundle } from '../plugins/Plugin';

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
  const initializedPlugins = useRef<{ plugin: Plugin; id: number }[]>([]);
  const ErrorFallbackScreen = useRef<
    PluginFactoryOptions['fallbackScreen'] | null
  >(null);

  const isInitializedRef = useRef(false);

  const initialize = useCallback(
    async (async = true) => {
      if (!plugins) {
        return;
      }

      const initializePlugin = async (
        plugin: PluginDef,
        getBundle: () => PluginsBundle,
        group: string | null,
        id: number,
      ) => {
        const initializationStartTime = new Date().valueOf();
        if (
          'dependsOn' in plugin &&
          plugin.dependsOn &&
          plugin.dependsOn.length
        ) {
          await PromiseUtils.waitUntil(
            () =>
              !plugin.dependsOn!.find(
                (x) =>
                  !initializedPlugins.current.find((y) => y.plugin.name === x),
              ),
          );
        }

        try {
          if ('useValue' in plugin) {
            await timeout(
              plugin.useValue.initialize(getBundle()),
              plugin.timeout === null
                ? null
                : plugin.timeout ?? plugin.useValue.initializationTimeout,
              `${plugin.useValue.name} timeout error`,
            );
            initializedPlugins.current.push({
              plugin: plugin.useValue,
              id,
            });
          } else if ('useFactory' in plugin) {
            const initializedPlugin = await timeout(
              plugin.useFactory(getBundle()),
              plugin.timeout === null ? null : plugin.timeout,
              `${plugin.name} timeout error`,
            );

            if (initializedPlugin) {
              await timeout(
                initializedPlugin.initialize(getBundle()),
                plugin.timeout === null
                  ? null
                  : plugin.timeout ?? initializedPlugin.initializationTimeout,
                `${initializedPlugin.name} timeout error`,
              );
              initializedPlugins.current.push({
                plugin: initializedPlugin,
                id,
              });
            }
          } else if ('useDeferredFactory' in plugin) {
            const promise = new ControlledPromise<void>();
            const pluginName = plugin.name ?? 'DeferredPlugin';

            const initializedPlugin = await timeout(
              plugin.useDeferredFactory(
                getBundle(),
                promise.resolve,
                promise.reject,
              ),
              plugin.timeout,
              `${pluginName} timeout error`,
            );

            const [, additionalData] = await timeout(
              Promise.all([
                initializedPlugin?.initialize(getBundle()),
                promise.wait(),
              ]),
              plugin.timeout === null
                ? null
                : plugin.timeout ?? initializedPlugin?.initializationTimeout,
              `${pluginName} timeout error`,
            );

            if (initializedPlugin) {
              initializedPlugin.payload = additionalData;
              initializedPlugins.current.push({
                plugin: initializedPlugin,
                id,
              });
            }
          } else {
            initializedPlugins.current.push({ plugin, id });
          }

          const lastPlugin =
            initializedPlugins.current[initializedPlugins.current.length - 1]
              .plugin;

          console.info(
            [
              chalkCtx[group ? 'blue' : 'yellow'](`[${lastPlugin.name}]`),
              chalkCtx.green(
                `Plugin${group ? ` {group: ${group}} ` : ' '}initialized`,
              ),
              chalkCtx[group ? 'blue' : 'yellow'](
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
                  chalkCtx[group ? 'blue' : 'yellow'](`[${pluginName}]`),
                  chalkCtx.red(
                    `Plugin${
                      group ? ` {group: ${group}} ` : ' '
                    }initialization timeout`,
                  ),
                  chalkCtx[group ? 'blue' : 'yellow'](
                    `+${(
                      new Date().valueOf() - initializationStartTime
                    ).toFixed(0)}ms`,
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

      const asyncQueue: Record<string, PQueue> = {};

      for (let i = 0; i < plugins.length; i += 1) {
        const plugin = plugins[i];
        const id = i;

        if (initializedPlugins.current.find((y) => y.id === id)) {
          continue;
        }

        try {
          if ('group' in plugin && plugin.group && async) {
            if (!asyncQueue[plugin.group]) {
              asyncQueue[plugin.group] = new PQueue({ concurrency: 1 });
            }

            const queue = asyncQueue[plugin.group];

            queue.add(async () => {
              try {
                await initializePlugin(
                  plugin,
                  () =>
                    new PluginsBundle(
                      initializedPlugins.current.map((x) => x.plugin),
                    ),
                  plugin.group!,
                  id,
                );
              } catch {
                // no-op
              }

              if (isInitializedRef.current && !queue.size) {
                setPluginsBundle(
                  new PluginsBundle(
                    initializedPlugins.current.map((x) => x.plugin),
                  ),
                );
              }
            });
            continue;
          }

          await initializePlugin(
            plugin,
            () =>
              new PluginsBundle(
                initializedPlugins.current.map((x) => x.plugin),
              ),
            null,
            id,
          );
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

      setPluginsBundle(
        new PluginsBundle(initializedPlugins.current.map((x) => x.plugin)),
      );
      isInitializedRef.current = true;
    },
    [plugins],
  );

  const retryInitialization = useCallback(async () => {
    try {
      setIsRetrying(true);
      await initialize(false);

      setInitializationError(null);
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    } finally {
      setIsRetrying(false);
    }
  }, [initialize]);

  useAsyncEffect(async () => {
    try {
      await initialize(true);
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
        <PluginsBundleProvider
          bundle={pluginsBundle}
          retryInitialization={retryInitialization}
        >
          <AlertsProvider>
            <DropDownProvider>
              <InAppPurchaseProvider>
                {children}
                <View
                  pointerEvents="box-none"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    right: 0,
                  }}
                >
                  <PortalHost name="ModalHost" />
                </View>
              </InAppPurchaseProvider>
            </DropDownProvider>
          </AlertsProvider>
        </PluginsBundleProvider>
      ) : (
        renderError()
      )}
    </AppSplashScreen>
  );
}
