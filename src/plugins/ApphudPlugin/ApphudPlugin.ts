import type { InitializedPlugin, Plugin, PluginFeature } from 'plugins/Plugin';
import ApphudSdk, { type StartProperties } from '@kirz/react-native-apphud-sdk';

export class ApphudPlugin implements Plugin {
  readonly name = ApphudPlugin.name;

  readonly features: PluginFeature[] = ['IAPReceiptValidator'];

  constructor(
    readonly options: Omit<StartProperties, 'observerMode'>,
  ) {}

  async init(): Promise<InitializedPlugin | string> {
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
