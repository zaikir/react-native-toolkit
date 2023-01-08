import type { InitializedPlugin, Plugin, PluginFeature } from 'plugins/Plugin';
import type { AnalyticsProvider } from 'plugins/types';
import appsFlyer, { InitSDKOptions } from 'react-native-appsflyer';

export class AppsFlyerPlugin implements Plugin {
  readonly name = AppsFlyerPlugin.name;

  readonly features: PluginFeature[] = ['Analytics'];

  constructor(
    readonly options: InitSDKOptions,
    readonly successCallback?: (result?: any) => any,
    readonly errorCallback?: (error?: any) => any,
  ) {}

  async init(): Promise<InitializedPlugin | string> {
    appsFlyer.initSdk(
      {
        isDebug: false,
        onInstallConversionDataListener: true,
        timeToWaitForATTUserAuthorization: 10, // for iOS 14.5
        ...this.options,
      },
      (result) => {
        this.successCallback?.(result);
      },
      (error) => {
        console.error(error);

        this.errorCallback?.(error);
      },
    );

    return {
      instance: this,
      data: {
        async logEvent(event, parameters) {
          await appsFlyer.logEvent(event, parameters as any);
        },
      } as AnalyticsProvider,
    };
  }
}
