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
export { Plugin } from './plugins/Plugin';

// hooks
export { useAlerts } from './hooks/useAlerts';
export { useRemoteConfig } from './hooks/useRemoteConfig';
export { useTheme } from './hooks/useTheme';
export { useStorage, useStoredState } from './hooks/useStorage';

// other
export { scale as scaleX, verticalScale as scaleY } from 'react-native-size-matters';
export { default as SyncStorage } from './utils/SyncStorage';
