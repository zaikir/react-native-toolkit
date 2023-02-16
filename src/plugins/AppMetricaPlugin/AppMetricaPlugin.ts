import AppMetrica, { AppMetricaConfig } from '@kirz/react-native-appmetrica';

import { Plugin, PluginFeature } from 'plugins/Plugin';
import type { IAnalyticsProvider } from 'plugins/types';

export class AppMetricaPlugin extends Plugin implements IAnalyticsProvider {
  readonly name = 'AppMetricaPlugin';
  readonly features: PluginFeature[] = ['Analytics'];
  readonly initializationTimeout = 5000;

  get instance() {
    return AppMetrica;
  }

  constructor(readonly options: AppMetricaConfig) {
    super();
  }

  async initialize() {
    AppMetrica.activate({
      firstActivationAsUpdate: true,
      sessionTimeout: 120,
      ...this.options,
    });
  }

  async logEvent(event: string, parameters?: Record<string, any> | undefined) {
    AppMetrica.reportEvent(event, parameters);
  }
}
