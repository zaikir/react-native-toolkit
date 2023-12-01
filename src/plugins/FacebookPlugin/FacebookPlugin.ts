import { AppEventsLogger, AppLink, Settings } from 'react-native-fbsdk-next';

import { Plugin, PluginFeature } from '../Plugin';
import type { IAnalyticsProvider } from '../types';

export class FacebookPlugin extends Plugin implements IAnalyticsProvider {
  readonly name = 'FacebookPlugin';
  readonly features: PluginFeature[] = ['Analytics'];
  readonly initializationTimeout = 5000;

  get instance() {
    return {
      ...AppEventsLogger,
      ...AppLink,
      ...Settings,
    };
  }

  /**
   * Requires FACEBOOK_APP_ID and FACEBOOK_CLIENT_TOKEN environment variables to exist
   */
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor() {
    super();
  }

  async initialize() {}

  async logEvent(event: string, parameters?: Record<string, any> | undefined) {
    AppEventsLogger.logEvent(event, parameters as any);
  }
}
