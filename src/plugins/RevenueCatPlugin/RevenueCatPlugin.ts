import type { InitializedPlugin, Plugin, PluginFeature } from 'plugins/Plugin';
import Purchases from 'react-native-purchases';

export class RevenueCatPlugin implements Plugin {
  readonly name = RevenueCatPlugin.name;

  readonly features: PluginFeature[] = ['InAppPurchases'];

  constructor(
    readonly options: {
      apiKey: string,
      products: { id: string, type: 'subscription' | 'product' }[],
      verbose?: boolean
    },
  ) {}

  async init(): Promise<InitializedPlugin | string> {
    Purchases.setDebugLogsEnabled(this.options.verbose || false);
    Purchases.configure({ apiKey: this.options.apiKey });

    const [subscriptions, products] = await Promise.all([
      this.options.products.some((x) => x.type === 'subscription') ? Purchases.getProducts(
        this.options.products.map((x) => x.id),
        Purchases.PURCHASE_TYPE.SUBS,
      ) : Promise.resolve([]),
      this.options.products.some((x) => x.type === 'product') ? Purchases.getProducts(
        this.options.products.map((x) => x.id),
        Purchases.PURCHASE_TYPE.INAPP,
      ) : Promise.resolve([]),
    ]);

    return {
      instance: this,
      data: {
        products: [...subscriptions, ...products],
        isSubscribed: () => false,
        getSubscription: () => null,
        purchaseProduct: () => true,
        restorePurchases: () => true,
      },
    };
  }
}
