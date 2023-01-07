import type { InitializedPlugin, Plugin, PluginFeature } from 'plugins/Plugin';
import type { AnalyticsProvider } from 'plugins/types';
import { AppEventsLogger } from 'react-native-fbsdk-next';

export class FacebookPlugin implements Plugin {
  readonly name = FacebookPlugin.name;

  readonly features: PluginFeature[] = ['Analytics'];

  async init(): Promise<InitializedPlugin | string> {
    return {
      instance: this,
      data: {
        logEvent(event, parameters) {
          AppEventsLogger.logEvent(event, parameters as any);
        },
      } as AnalyticsProvider,
    };
  }
}
