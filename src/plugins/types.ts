export interface RemoteConfig {}

export interface AnalyticsProvider {
  logEvent: (event: string, parameters?: Record<string, any>) => void
}
