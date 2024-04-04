import { OneSignal } from 'react-native-onesignal';

import { Plugin, PluginFeature } from '../Plugin';

export class OneSignalPlugin extends Plugin {
  readonly name = 'OneSignalPlugin';
  readonly features: PluginFeature[] = ['PushNotification'];
  readonly initializationTimeout = null;

  get instance() {
    return OneSignal;
  }

  constructor(
    readonly appId: string,
    readonly options?: {
      requestPermission?: boolean;
    },
  ) {
    super();
  }

  async initialize() {
    OneSignal.initialize(this.appId);
    if (this.options?.requestPermission ?? true) {
      await OneSignal.Notifications.requestPermission(false);
    }
  }
}
