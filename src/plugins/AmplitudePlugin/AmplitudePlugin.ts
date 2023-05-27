import * as Amplitude from '@amplitude/analytics-react-native';

import { Plugin, PluginFeature } from 'plugins/Plugin';
import type { IAnalyticsProvider } from 'plugins/types';

export class AmplitudePlugin extends Plugin implements IAnalyticsProvider {
  readonly name = 'AmplitudePlugin';
  readonly features: PluginFeature[] = ['Analytics'];
  readonly initializationTimeout = 5000;

  readonly initParams: Parameters<(typeof Amplitude)['init']>;
  get instance() {
    return Amplitude;
  }

  constructor(...props: Parameters<(typeof Amplitude)['init']>) {
    super();

    this.initParams = props;
  }

  async initialize() {
    this.instance.init(...this.initParams);
  }

  async logEvent(event: string, parameters?: Record<string, any> | undefined) {
    this.instance.track(event, parameters);
  }
}
