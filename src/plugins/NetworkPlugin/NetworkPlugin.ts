import NetInfo from '@react-native-community/netinfo';
import { CaptureConsole } from '@sentry/integrations';
import * as Sentry from '@sentry/react-native';

import { InitializationOptions, Plugin, PluginFeature } from 'plugins/Plugin';

export class NetworkPlugin extends Plugin {
  readonly name = NetworkPlugin.name;

  readonly features: PluginFeature[] = ['Network'];

  constructor(
    readonly options?: {
      offlineMode?: boolean;
    } & InitializationOptions,
  ) {
    super(options);
  }

  async init() {
    if (
      !(this.options?.offlineMode ?? true) &&
      (await NetInfo.fetch()).isInternetReachable
    ) {
      return { error: 'No internet connection', code: 'offline' as const };
    }

    return {
      instance: this,
      data: null,
    };
  }
}
