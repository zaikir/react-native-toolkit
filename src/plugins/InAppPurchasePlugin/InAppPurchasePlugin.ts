import { Platform } from 'react-native';
import * as IAP from 'react-native-iap';
import {
  PurchaseError,
  purchaseErrorListener,
  PurchaseStateAndroid,
  purchaseUpdatedListener,
  RequestSubscriptionAndroid,
  SubscriptionAndroid,
} from 'react-native-iap';

import { Plugin, PluginFeature, PluginsBundle } from 'plugins/Plugin';
import type {
  IAppPurchasePlugin,
  IReceiptValidator,
  Product,
  Purchase,
  Subscription,
} from 'plugins/types';
import { ControlledPromise } from 'utils/promise/control';

import { transformProduct } from './utils/transformProduct';
import { transformPurchase } from './utils/transformPurchase';
import { transformSubscription } from './utils/transformSubscription';

export class InAppPurchasePlugin extends Plugin implements IAppPurchasePlugin {
  readonly name = 'InAppPurchasePlugin';
  readonly features: PluginFeature[] = ['InAppPurchase'];
  readonly initializationTimeout = 5000;

  // @ts-ignore
  products: Product[];
  // @ts-ignore
  subscriptions: Subscription[];
  // @ts-ignore
  receiptValidator: IReceiptValidator;

  purchasePromise: ControlledPromise<IAP.Purchase> | null = null;

  constructor(
    readonly options: {
      products: {
        productId: string;
        type:
          | 'subscription'
          | 'consumable'
          | 'non-consumable'
          | 'lifetime-premium';
      }[];
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

      this.receiptValidator = iapReceiptValidator;
      await this.refetchProducts();

      purchaseUpdatedListener(async (purchase) => {
        const product = this.products.find(
          (x) => x.productId === purchase.productId,
        );

        try {
          if (!product) {
            console.error('Unknown product: ' + purchase.productId);
            return;
          }

          const timestamp = new Date().valueOf();
          const purchaseDate = purchase.transactionDate;

          if (Math.abs(purchaseDate - timestamp) > 1000 * 60 * 30) {
            return;
          }

          if (
            !purchase.purchaseStateAndroid ||
            (Platform.OS === 'android' &&
              [
                PurchaseStateAndroid.PENDING,
                PurchaseStateAndroid.UNSPECIFIED_STATE,
              ].includes(purchase.purchaseStateAndroid))
          ) {
            console.warn(
              `Skip purchase with status ${purchase.purchaseStateAndroid}`,
            );
            return;
          }

          await IAP.finishTransaction({
            purchase,
            isConsumable: product ? product.consumable : true,
          }).catch(console.error);

          this.purchasePromise?.resolve(purchase);
        } catch (err) {
          this.purchasePromise?.reject(err);
        }
      });

      purchaseErrorListener(async (errorEvent: PurchaseError) => {
        this.purchasePromise?.reject(errorEvent);
      });
    } finally {
      IAP.endConnection();
    }
  }

  public async refetchProducts() {
    const productSkus = this.options.products
      .filter((x) => x.type !== 'subscription')
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

    const products = fetchedProducts.map((x) =>
      transformProduct(
        x,
        this.options.products.find((y) => y.productId === x.productId)!.type ===
          'consumable',
      ),
    );

    const subscriptions = await Promise.all(
      fetchedSubscriptions.map(async (x) => {
        const { trial, ...subscription } = transformSubscription(x);
        const isTrialAvailable =
          !!trial &&
          (Platform.OS === 'android' ||
            (await this.receiptValidator.isTrialAvailable(
              subscription.productId,
            )));

        return {
          ...subscription,
          ...(isTrialAvailable && { trial }),
        };
      }),
    );

    this.products = products;
    this.subscriptions = subscriptions;
  }

  public async purchaseProduct(productId: string): Promise<Purchase> {
    const productDef = this.options.products.find(
      (x) => x.productId === productId,
    );

    if (!productDef) {
      throw new Error(`Unknown product "${productId}"`);
    }

    if (productDef.type === 'subscription') {
      // Handle android purchase request
      if (Platform.OS === 'android') {
        const subscription = this.subscriptions.find(
          (x) => x.productId === productId,
        )!;

        const offerToken = (subscription.originalData as SubscriptionAndroid)
          .subscriptionOfferDetails[0]?.offerToken!;

        const subscriptionRequest: RequestSubscriptionAndroid = {
          subscriptionOffers: [
            {
              sku: productId,
              offerToken,
            },
          ],
        };

        IAP.requestSubscription({
          sku: productId,
          subscriptionOffers: subscriptionRequest.subscriptionOffers,
        });
      } else {
        IAP.requestSubscription({
          sku: productId,
        });
      }
    } else {
      IAP.requestPurchase(
        Platform.OS === 'ios' ? { sku: productId } : { skus: [productId] },
      );
    }

    this.purchasePromise = new ControlledPromise();
    const purchase = await this.purchasePromise.wait();

    return transformPurchase(purchase);
  }
}
