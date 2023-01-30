import ApphudSdk, { type StartProperties } from '@kirz/react-native-apphud-sdk';

import { Plugin, PluginFeature } from 'plugins/Plugin';

export class ApphudPlugin extends Plugin {
  readonly name = 'ApphudPlugin';

  readonly features: PluginFeature[] = ['IAPReceiptValidator'];

  constructor(readonly options: Omit<StartProperties, 'observerMode'>) {
    super();
  }

  async initialize() {
    await ApphudSdk.start({ ...this.options, observerMode: true });
  }

  hasActiveSubscription() {
    return ApphudSdk.hasActiveSubscription();
  }

  async restorePurchases() {
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
  }
}
