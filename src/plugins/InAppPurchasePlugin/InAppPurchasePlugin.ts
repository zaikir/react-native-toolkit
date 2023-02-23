import { Platform } from 'react-native';
import * as IAP from 'react-native-iap';

import { Plugin, PluginFeature, PluginsBundle } from 'plugins/Plugin';
import type { IReceiptValidator, Product, Subscription } from 'plugins/types';

import { transformProduct } from './utils/transformProduct';
import { transformSubscription } from './utils/transformSubscription';

export class InAppPurchasePlugin extends Plugin {
  readonly name = 'InAppPurchasePlugin';
  readonly features: PluginFeature[] = ['InAppPurchase'];
  readonly initializationTimeout = 5000;

  // @ts-ignore
  products: Product[];
  // @ts-ignore
  subscriptions: Subscription[];
  // @ts-ignore
  receiptValidator: IReceiptValidator;

  constructor(
    readonly options: {
      products: { productId: string; type: 'subscription' | 'product' }[];
      verbose?: boolean;
    },
  ) {
    super();
  }

  async initialize(bundle: PluginsBundle) {
    try {
      const iapReceiptValidator = bundle.getByFeature<IReceiptValidator>(
        'IAPReceiptValidator',
      );

      if (!iapReceiptValidator) {
        throw new Error('No receipt validator found');
      }

      await IAP.initConnection();

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
      const subscriptions = await Promise.all(
        fetchedSubscriptions.map((x) => {
          const { trial, ...subscription } = transformSubscription(x);
          const isTrialAvailable =
            !!trial &&
            iapReceiptValidator.isTrialAvailable(subscription.productId);

          return {
            ...subscription,
            ...(isTrialAvailable && { trial }),
          };
        }),
      );

      this.products = products;
      this.subscriptions = subscriptions;
      this.receiptValidator = iapReceiptValidator;
    } finally {
      IAP.endConnection();
    }
  }
}
