import type { InitializedPlugin, Plugin, PluginFeature } from 'plugins/Plugin';
import type { AnalyticsProvider } from 'plugins/types';
import appsFlyer, { InitSDKOptions } from 'react-native-appsflyer';

export class AppsFlyerPlugin implements Plugin {
  readonly name = AppsFlyerPlugin.name;

  readonly features: PluginFeature[] = ['Analytics'];

  constructor(
    readonly options: InitSDKOptions,
    readonly callbacks?: {
      onAppOpenAttribution?: Parameters<typeof appsFlyer.onAppOpenAttribution>[0],
      onAttributionFailure?: Parameters<typeof appsFlyer.onAttributionFailure>[0],
      onDeepLink?: Parameters<typeof appsFlyer.onDeepLink>[0],
      onInstallConversionData?: Parameters<typeof appsFlyer.onInstallConversionData>[0],
      onInstallConversionFailure?: Parameters<typeof appsFlyer.onInstallConversionFailure>[0],
      onInitSuccess?: (result?: any) => any,
      onInitFailure?: (error?: any) => any,
    },
  ) {}

  async init(): Promise<InitializedPlugin | string> {
    if (this.callbacks?.onAppOpenAttribution) {
      appsFlyer.onAppOpenAttribution(this.callbacks.onAppOpenAttribution);
    }

    if (this.callbacks?.onAttributionFailure) {
      appsFlyer.onAttributionFailure(this.callbacks.onAttributionFailure);
    }

    if (this.callbacks?.onDeepLink) {
      appsFlyer.onDeepLink(this.callbacks.onDeepLink);
    }

    if (this.callbacks?.onInstallConversionData) {
      appsFlyer.onInstallConversionData(this.callbacks.onInstallConversionData);
    }

    if (this.callbacks?.onInstallConversionFailure) {
      appsFlyer.onInstallConversionFailure(this.callbacks.onInstallConversionFailure);
    }

    appsFlyer.initSdk(
      {
        isDebug: false,
        onInstallConversionDataListener: true,
        onDeepLinkListener: true,
        timeToWaitForATTUserAuthorization: 10, // for iOS 14.5
        ...this.options,
      },
      (result) => {
        this.callbacks?.onInitSuccess?.(result);
      },
      (error) => {
        console.error(error);

        this.callbacks?.onInitFailure?.(error);
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
