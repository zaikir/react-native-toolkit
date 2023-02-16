import { Platform } from 'react-native';
import * as IAP from 'react-native-iap';

import { Plugin, PluginFeature } from 'plugins/Plugin';

import { transformProduct } from './utils/transformProduct';
import { transformSubscription } from './utils/transformSubscription';

export class InAppPurchasePlugin extends Plugin {
  readonly name = 'InAppPurchasePlugin';
  readonly features: PluginFeature[] = ['InAppPurchase'];
  readonly initializationTimeout = 5000;

  constructor(
    readonly options: {
      products: { productId: string; type: 'subscription' | 'product' }[];
      verbose?: boolean;
    },
  ) {
    super();
  }

  async initialize() {
    try {
      /*
      1. initialization
      2. product fetch
      3. unify product model
      */

      const canMakePayments = await IAP.initConnection();
      // eslint-disable-next-line no-console
      console.info({ canMakePayments });

      if (Platform.OS === 'android') {
        try {
          await IAP.flushFailedPurchasesCachedAsPendingAndroid();
        } catch {
          // skip error
        }
      }

      if (Platform.OS === 'ios') {
        try {
          await IAP.clearTransactionIOS();
        } catch {
          // skip error
        }
      }

      const productSkus = this.options.products
        .filter((x) => x.type === 'product')
        .map((x) => x.productId);
      const subscriptionSkus = this.options.products
        .filter((x) => x.type === 'subscription')
        .map((x) => x.productId);

      const [fetchedProducts, fetchedSubscriptions] = await Promise.all([
        productSkus.length
          ? IAP.getProducts({ skus: productSkus })
          : Promise.resolve([]),
        subscriptionSkus.length
          ? IAP.getSubscriptions({ skus: subscriptionSkus })
          : Promise.resolve([]),
      ]);

      const products = fetchedProducts.map(transformProduct);
      const subscriptions = fetchedSubscriptions.map((x) =>
        transformSubscription(x, false),
      );
      console.log(products, subscriptions);
    } finally {
      IAP.endConnection();
    }
  }
}
