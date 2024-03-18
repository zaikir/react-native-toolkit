import ApphudSdk, {
  AndroidApphudAttributionProvider,
  IOSApphudAttributionProvider,
} from '@kirz/react-native-apphud';
import { Platform } from 'react-native';

import { Plugin, PluginFeature, PluginsBundle } from '../Plugin';

export class ApphudConnectorPlugin extends Plugin {
  readonly name = 'ApphudPlugin';
  readonly features: PluginFeature[] = ['IAPReceiptValidator'];
  readonly initializationTimeout = 15000;

  constructor(
    readonly connections: {
      appsflyer: object;
    },
  ) {
    super();
  }

  async initialize(bundle: PluginsBundle) {
    // Connect AppsFlyer to AppHud
    (async () => {
      const appsFlyer = (bundle.get('AppsFlyerPlugin') as any)?.instance;

      if (!appsFlyer) {
        return;
      }

      const ApphudAttributionProviderAppsFlyer = Platform.select<any>({
        ios: IOSApphudAttributionProvider.AppsFlyer,
        android: AndroidApphudAttributionProvider.appsFlyer,
      });

      appsFlyer.getAppsFlyerUID((err: any, uid: any) => {
        if (err) {
          console.error(err);
          return;
        }

        appsFlyer.onInstallConversionData(async (res: any) => {
          try {
            if (res.type === 'onInstallConversionDataLoaded') {
              await ApphudSdk.addAttribution({
                identifier: uid,
                data: res.data,
                attributionProviderId: ApphudAttributionProviderAppsFlyer,
              });
            }
          } catch (error) {
            console.error(error);
          }
        });

        appsFlyer.onInstallConversionFailure(async (res: any) => {
          try {
            if (res.type === 'onInstallConversionFailure') {
              await ApphudSdk.addAttribution({
                identifier: uid,
                data: {
                  error: res.data,
                },
                attributionProviderId: ApphudAttributionProviderAppsFlyer,
              });
            }
          } catch (error) {
            console.error(error);
          }
        });
      });
    })();

    // Connect Facebook to AppHud
    (async () => {
      const idfaPlugin = bundle.get('IdfaPlugin') as any;
      const facebook = (bundle.get('FacebookPlugin') as any)?.instance;

      if (!facebook) {
        return;
      }

      const ApphudAttributionProviderFacebook = Platform.select<any>({
        ios: 3,
        android: AndroidApphudAttributionProvider.facebook,
      });

      await ApphudSdk.addAttribution({
        identifier: null as any,
        data: {},
        attributionProviderId: ApphudAttributionProviderFacebook,
      });

      if (idfaPlugin?.idfa) {
        facebook.setAdvertiserTrackingEnabled(true);
      }
    })();

    // Connect Branch to AppHud
    (async () => {
      const branch = (bundle.get('BranchPlugin') as any)?.instance;
      if (!branch) {
        return;
      }

      const deviceId = await ApphudSdk.userId();
      branch.setIdentity(deviceId);
    })();

    // Connect Firebase to AppHud
    (async () => {
      const firebase = (bundle.get('FirebasePlugin') as any)?.instance;
      if (!firebase) {
        return;
      }

      const appInstanceId = await firebase.analytics.getAppInstanceId();

      if (appInstanceId) {
        ApphudSdk.addAttribution({
          data: {},
          attributionProviderId:
            Platform.OS === 'ios' ? 4 : ('fireabse' as any),
          identifier: appInstanceId,
        });
      }
    })();
  }
}
