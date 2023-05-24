import { Amplitude } from '@amplitude/react-native';

import { Plugin, PluginFeature } from 'plugins/Plugin';
import type { IAnalyticsProvider } from 'plugins/types';

export class AmplitudePlugin extends Plugin implements IAnalyticsProvider {
  readonly name = 'AmplitudePlugin';
  readonly features: PluginFeature[] = ['Analytics'];
  readonly initializationTimeout = 5000;

  get instance() {
    return Amplitude.getInstance();
  }

  constructor(readonly apiKey: string) {
    super();
  }

  async initialize() {
    this.instance.init(this.apiKey);
  }

  async logEvent(event: string, parameters?: Record<string, any> | undefined) {
    this.instance.logEvent(event, parameters);
  }
}
