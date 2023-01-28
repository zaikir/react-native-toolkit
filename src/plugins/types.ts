export interface RemoteConfig {}

export interface NetworkPluginData {
  isInternetReachable: () => Promise<boolean>;
}

export interface IRemoteConfigPlugin {
  readonly remoteValues: Record<string, any>;
}

export interface IAnalyticsProvider {
  logEvent: (event: string, parameters?: Record<string, any>) => Promise<void>;
}
