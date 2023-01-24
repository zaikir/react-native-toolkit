import { AppEventsLogger } from 'react-native-fbsdk-next';

import type {
  InitializationError,
  InitializedPlugin,
  Plugin,
  PluginFeature,
} from 'plugins/Plugin';
import type { AnalyticsProvider } from 'plugins/types';

export class FacebookPlugin implements Plugin {
  readonly name = FacebookPlugin.name;

  readonly features: PluginFeature[] = ['Analytics'];

  async init(): Promise<InitializedPlugin | InitializationError> {
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
