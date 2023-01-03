export * from './theme';
export { hide as hideSplash } from 'react-native-bootsplash';

// components
export { Text } from './components/Text';
export { AppBootstrapper } from './components/AppBootstrapper';
export { AlertsProvider, DropdownAlert } from './contexts/AlertsContext';

// plugins
export { Plugin } from './plugins/Plugin';
export { RemoteConfig } from './plugins/types';
export { SentryPlugin } from './plugins/Sentry';
export { FirebaseRemoteConfig } from './plugins/FirebaseRemoteConfig';

// hooks
export { default as useAlerts } from './hooks/useAlerts';
export { default as useRemoteConfig } from './hooks/useRemoteConfig';
