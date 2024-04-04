import { OneSignal } from 'react-native-onesignal';

import { Plugin, PluginFeature } from '../Plugin';

export class OneSignalPlugin extends Plugin {
  readonly name = 'OneSignalPlugin';
  readonly features: PluginFeature[] = ['PushNotification'];
  readonly initializationTimeout = 5000;

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
      OneSignal.Notifications.requestPermission(false);
    }
  }
}
