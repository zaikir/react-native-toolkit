import Purchases from 'react-native-purchases';

import {
  InitializationError,
  InitializationOptions,
  InitializedPlugin,
  Plugin,
  PluginFeature,
} from 'plugins/Plugin';

export class RevenueCatPlugin extends Plugin {
  readonly name = RevenueCatPlugin.name;

  readonly features: PluginFeature[] = ['InAppPurchase'];

  constructor(
    readonly options: {
      apiKey: string;
      products: { id: string; type: 'subscription' | 'product' }[];
      verbose?: boolean;
    } & InitializationOptions,
  ) {
    super(options);
  }

  async init() {
    Purchases.setDebugLogsEnabled(this.options.verbose ?? false);
    Purchases.configure({ apiKey: this.options.apiKey });

    const products = await Purchases.getProducts(
      this.options.products.map((x) => x.id),
      Purchases.PURCHASE_TYPE.SUBS,
    );

    return {
      instance: this,
      data: {
        products,
        isSubscribed: () => false,
        getSubscription: () => null,
        purchaseProduct: () => true,
        restorePurchases: () => true,
      },
    };
  }
}