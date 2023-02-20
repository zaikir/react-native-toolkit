import { Platform } from 'react-native';
import * as IAP from 'react-native-iap';
import type { ProductPurchase, SubscriptionPurchase } from 'react-native-iap';

import { Plugin, PluginFeature } from 'plugins/Plugin';

import type { Product } from './types/product';
import type { Purchase } from './types/purchases';
import type { Subscription } from './types/subscription';
import { buildPurchase } from './utils/buildPurchase';
import { transformProduct } from './utils/transformProduct';
import { transformSubscription } from './utils/transformSubscription';
import { PromiseUtils } from '../../utils/promise';

export class InAppPurchasePlugin extends Plugin {
  readonly name = 'InAppPurchasePlugin';
  readonly features: PluginFeature[] = ['InAppPurchase'];
  readonly initializationTimeout = 30000;

  private products: Product[] = [];
  private subscriptions: Subscription[] = [];
  private isTrialUsed: boolean = false;
  private activeSubscription:
    | (Subscription & {
        purchase: Purchase;
      })
    | null = null;

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
      const canMakePayments = await IAP.initConnection();

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
          ? PromiseUtils.retry(() => IAP.getProducts({ skus: productSkus }))
          : Promise.resolve([]),
        subscriptionSkus.length
          ? PromiseUtils.retry(() =>
              IAP.getSubscriptions({ skus: subscriptionSkus }),
            )
          : Promise.resolve([]),
      ]);

      this.products = fetchedProducts.map(transformProduct);
      this.subscriptions = fetchedSubscriptions.map(transformSubscription);

      console.log(this.products, this.subscriptions);
    } finally {
      IAP.endConnection();
    }
  }

  async getPurchaseHistory(): Promise<Purchase[]> {
    const purchases = await PromiseUtils.timeout(
      IAP.getPurchaseHistory(),
      15000,
    );

    return purchases
      .map((purchase) => buildPurchase(purchase))
      .sort((a, b) => b.transactionDate - a.transactionDate);
  }

  async restoreSubscription() {
    this.isTrialUsed = false;
    this.activeSubscription = null;

    const history = await this.getPurchaseHistory();
    if (!history.length) {
      return;
    }

    const lastPurchase = history[0];
    const { isValid } = await this.validatePurchase(lastPurchase);

    if (!isValid) {
      console.error('Purchase validation failed');
      return;
    }

    lastPurchase.ss;
  }

  validatePurchase(purchase: Purchase): Promise<{ isValid: boolean }> {
    return { isValid: true };
  }
}

/*
1. trigger restore only manually
2. save restore result in local storage
3. validate purchase on backend
*/
