export * from './theme';
export { hide as hideSplash } from 'react-native-bootsplash';

// components
export { Text, type TextProps } from './components/Text';
export { AppBootstrapper } from './components/AppBootstrapper';
export { AlertsContextType } from './contexts/AlertsContext';
export { ThemeProvider } from './contexts/ThemeContext';
export { StorageProvider } from './contexts/StorageContext';
export { ColorSchemeProvider } from './contexts/ColorSchemeContext';
export { PluginsBundleContext } from './contexts/PluginsBundleContext';
export {
  KeyboardDismissView,
  type KeyboardDismissViewProps,
} from './components/KeyboardDismissView';

// plugins
export {
  Plugin,
  FallbackScreenProps,
  PluginFactoryOptions,
  PluginsBundle,
  PluginFeature,
} from './plugins/Plugin';
export {
  RemoteConfig,
  NetworkPluginData,
  IRemoteConfigPlugin,
  IAnalyticsProvider,
  IAppPurchasePlugin,
  IReceiptValidator,
  Product,
  Purchase,
  PurchasedProductInfo,
  PurchasedSubscriptionInfo,
  Subscription,
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
export { usePlugin } from './hooks/usePlugin';
export { useAppActivityEffect } from './hooks/useAppActivityEffect';

// other
export { default as SyncStorage } from './utils/SyncStorage';
export { ControlledPromise } from './utils/promise/control';
export { PromiseUtils } from './utils/promise/utils';
export { MathUtils } from './utils/math';
export { ScaleReference, scaleX, scaleY } from './utils/scale';
export { timeout } from './utils/promise/timeout';
export { wait } from './utils/promise/wait';
export { waitUntil } from './utils/promise/waitUntil';
