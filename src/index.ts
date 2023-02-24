export * from './theme';
export { hide as hideSplash } from 'react-native-bootsplash';

// components
export { Text } from './components/Text';
export { AppBootstrapper } from './components/AppBootstrapper';
export { AlertsProvider, DropdownAlert } from './contexts/AlertsContext';
export { ThemeProvider } from './contexts/ThemeContext';
export { StorageProvider } from './contexts/StorageContext';
export { ColorSchemeProvider } from './contexts/ColorSchemeContext';

// plugins
export {
  Plugin,
  FallbackScreenProps,
  PluginFactoryOptions,
  PluginsBundle,
} from './plugins/Plugin';
export {
  RemoteConfig,
  NetworkPluginData,
  IRemoteConfigPlugin,
  IAnalyticsProvider,
} from './plugins/types';

// hooks
export { useAlerts } from './hooks/useAlerts';
export { useRemoteConfig } from './hooks/useRemoteConfig';
export { useTheme } from './hooks/useTheme';
export { useStorage, useStoredState } from './hooks/useStorage';
export { useColorScheme } from './hooks/useColorScheme';
export { useAnalytics } from './hooks/useAnalytics';
export { useSplashScreen } from './hooks/useSplashScreen';
export { usePurchases } from './hooks/usePurchases';

// other
export { default as SyncStorage } from './utils/SyncStorage';
export { ControlledPromise } from './utils/promise/control';
export { ScaleReference, scaleX, scaleY } from './utils/scale';
export { timeout } from './utils/promise/timeout';
export { wait } from './utils/promise/wait';
