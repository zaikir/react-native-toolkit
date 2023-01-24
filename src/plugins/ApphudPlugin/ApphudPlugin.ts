import ApphudSdk, { type StartProperties } from '@kirz/react-native-apphud-sdk';

import { InitializationOptions, Plugin, PluginFeature } from 'plugins/Plugin';

export class ApphudPlugin extends Plugin {
  readonly name = ApphudPlugin.name;

  readonly features: PluginFeature[] = ['IAPReceiptValidator'];

  constructor(
    readonly options: Omit<StartProperties, 'observerMode'> &
      InitializationOptions,
  ) {
    super(options);
  }

  async init() {
    await ApphudSdk.start({ ...this.options, observerMode: true });

    return {
      instance: this,
      data: {
        hasActiveSubscription: () => ApphudSdk.hasActiveSubscription(),
        restorePurchases: async () => {
          const result = await ApphudSdk.restorePurchases();
          if (result.error) {
            throw new Error(result.error);
          }

          return {
            products: result.purchases.map((x) => ({
              productId: x.sku!,
              originalData: x,
            })),
            subscriptions: result.subscriptions.map((x) => ({
              productId: x.productId,
              expiresAt: x.expiresAt,
              originalData: x,
            })),
          };
        },
      },
    };
  }
}