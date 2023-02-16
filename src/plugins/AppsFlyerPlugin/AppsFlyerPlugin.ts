import appsFlyer, { InitSDKOptions } from 'react-native-appsflyer';

import { Plugin, PluginFeature } from 'plugins/Plugin';
import type { IAnalyticsProvider } from 'plugins/types';

export class AppsFlyerPlugin extends Plugin implements IAnalyticsProvider {
  readonly name = 'AppsFlyerPlugin';
  readonly features: PluginFeature[] = ['Analytics'];
  readonly initializationTimeout = 5000;

  get instance() {
    return appsFlyer;
  }

  constructor(
    readonly options: InitSDKOptions,
    readonly callbacks?: {
      onAppOpenAttribution?: Parameters<
        typeof appsFlyer.onAppOpenAttribution
      >[0];
      onAttributionFailure?: Parameters<
        typeof appsFlyer.onAttributionFailure
      >[0];
      onDeepLink?: Parameters<typeof appsFlyer.onDeepLink>[0];
      onInstallConversionData?: Parameters<
        typeof appsFlyer.onInstallConversionData
      >[0];
      onInstallConversionFailure?: Parameters<
        typeof appsFlyer.onInstallConversionFailure
      >[0];
      onInitSuccess?: (result?: any) => any;
      onInitFailure?: (error?: any) => any;
    },
  ) {
    super();
  }

  async initialize() {
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
      appsFlyer.onInstallConversionFailure(
        this.callbacks.onInstallConversionFailure,
      );
    }

    await new Promise<void>((resolve, reject) => {
      appsFlyer.initSdk(
        {
          isDebug: false,
          onInstallConversionDataListener: true,
          onDeepLinkListener: true,
          timeToWaitForATTUserAuthorization: 10, // for iOS 14.5
          ...this.options,
        },
        (result) => {
          resolve();
          this.callbacks?.onInitSuccess?.(result);
        },
        (error) => {
          console.error(error);

          reject(error);
          this.callbacks?.onInitFailure?.(error);
        },
      );
    });
  }

  async logEvent(event: string, parameters?: Record<string, any> | undefined) {
    await appsFlyer.logEvent(event, parameters as any);
  }
}
