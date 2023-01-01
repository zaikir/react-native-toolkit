export * from './theme';
export { hide as hideSplash } from 'react-native-bootsplash';

// components
export { Text } from './components/Text';
export { AppBootstrapper } from './components/AppBootstrapper';
export { AlertsProvider } from './contexts/AlertsContext';

// plugins
export { SentryPlugin } from './plugins/Sentry';

// hooks
export { default as useAlerts } from './hooks/useAlerts';
