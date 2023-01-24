import { AppEventsLogger } from 'react-native-fbsdk-next';

import { InitializationOptions, Plugin, PluginFeature } from 'plugins/Plugin';
import type { AnalyticsProvider } from 'plugins/types';

export class FacebookPlugin extends Plugin {
  readonly name = FacebookPlugin.name;

  readonly features: PluginFeature[] = ['Analytics'];

  constructor(options: InitializationOptions = {}) {
    super(options);
  }

  async init() {
    return {
      instance: this,
      data: {
        async logEvent(event, parameters) {
          AppEventsLogger.logEvent(event, parameters as any);
        },
      } as AnalyticsProvider,
    };
  }
}
