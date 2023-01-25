export interface RemoteConfig {}

export interface AnalyticsProvider {
  logEvent: (event: string, parameters?: Record<string, any>) => Promise<void>;
}

export interface NetworkPluginData {
  isInternetReachable: () => Promise<boolean>;
}

export interface IRemoteConfigPlugin {
  readonly values: Record<string, any>;
}
