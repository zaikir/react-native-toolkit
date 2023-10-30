export * from './theme';
export { hide as hideSplash } from 'react-native-bootsplash';

// components
export {
  FullscreenCarousel,
  type FullscreenCarouselProps,
  type FullscreenCarouselRef,
  type FullscreenCarouselContext,
} from './components/FullscreenCarousel';
export {
  AutoplayCarouselProgressBar,
  type AutoplayCarouselProgressBarProps,
} from './components/AutoplayCarouselProgressBar';
export {
  AutoplayCarouselProgressBarItem,
  type AutoplayCarouselProgressBarItemProps,
} from './components/AutoplayCarouselProgressBarItem';
export { View, type ViewProps, type ViewStyle } from './components/View';
export { FadeView, type FadeViewProps } from './components/FadeView';
export { BlurView, type BlurViewProps } from './components/BlurView';
export { Text, type TextProps, type TextStyle } from './components/Text';
export {
  ListView,
  type ListViewProps,
  type ListViewLayoutProps,
} from './components/ListView';
export { AppBootstrapper } from './components/AppBootstrapper';
export { AlertsProvider } from './contexts/AlertsContext';
export { ThemeProvider } from './contexts/ThemeContext';
export { StorageProvider } from './contexts/StorageContext';
export { ColorSchemeProvider } from './contexts/ColorSchemeContext';
export { PluginsBundleContext } from './contexts/PluginsBundleContext';
export { DropDownContext, DropDownProvider } from './contexts/DropDownContext';
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
export { useDropdown } from './hooks/useDropdown';
export { usePermissions } from './hooks/usePermissions';
export { useAlert } from './hooks/useAlert';
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
export { AutoplayAction } from './utils/AutoplayAction';
export { ControlledPromise } from './utils/promise/control';
export { PromiseUtils } from './utils/promise/utils';
export { MathUtils } from './utils/math';
export { ScaleReference, scaleX, scaleY } from './utils/scale';
export { timeout } from './utils/promise/timeout';
export { wait } from './utils/promise/wait';
export { waitUntil } from './utils/promise/waitUntil';
export { SvgUtils } from './utils/svg';
