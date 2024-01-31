import ApphudSdk, { type StartProperties } from '@kirz/react-native-apphud';
import { Platform } from 'react-native';

import { Plugin, PluginFeature } from '../Plugin';
import type {
  IReceiptValidator,
  PurchasedProductInfo,
  PurchasedSubscriptionInfo,
} from '../types';
import { PromiseUtils } from 'index';

export class ApphudPlugin extends Plugin implements IReceiptValidator {
  readonly name = 'ApphudPlugin';
  readonly features: PluginFeature[] = ['IAPReceiptValidator'];
  readonly initializationTimeout = 15000;

  constructor(readonly options: Omit<StartProperties, 'observerMode'>) {
    super();
  }

  async initialize() {
    await ApphudSdk.start({ ...this.options, observerMode: true });
  }

  async isTrialAvailable(subscriptionId: string): Promise<boolean> {
    try {
      return await PromiseUtils.timeout(ApphudSdk.checkEligibilitiesForIntroductoryOffer(
        subscriptionId,
      ), 5000)
    } catch {
      return false
    }
  }

  async hasPremiumAccess(): Promise<boolean> {
    return await ApphudSdk.hasPremiumAccess();
  }

  async hasActiveSubscription(): Promise<boolean> {
    return await ApphudSdk.hasActiveSubscription();
  }

  async getPurchasedSubscriptions(): Promise<PurchasedSubscriptionInfo[]> {
    const subscriptions = await ApphudSdk.subscriptions();
    // Platform.OS === 'ios'
    //   ? [await ApphudSdk.subscription()]
    //   : await ApphudSdk.subscriptions();

    return subscriptions.map((x) => {
      if (Platform.OS === 'ios') {
        const subscription = x as unknown as {
          productId: string;
          canceledAt: number | null;
          expiresDate: number;
          isActive: boolean;
          isAutorenewEnabled: boolean;
          isInRetryBilling: boolean;
          isIntroductoryActivated: boolean;
          isLocal: boolean;
          isSandbox: boolean;
          startedAt: number;
          status: number;
        };

        return {
          productId: subscription.productId,
          expiresAt: new Date(subscription.expiresDate * 1000).toISOString(),
          startedAt: new Date(subscription.startedAt * 1000).toISOString(),
          cancelledAt: subscription.canceledAt
            ? new Date(subscription.canceledAt * 1000).toISOString()
            : undefined,
          isAutoRenewEnabled: subscription.isAutorenewEnabled,
          isActive: subscription.isActive,
          isSandbox: subscription.isSandbox,
        };
      }

      return {
        productId: x.productId,
        expiresAt: new Date(parseInt(x.expiresAt, 10)).toISOString(),
        // @ts-ignore
        startedAt: new Date(parseInt(x.statedAt, 10)).toISOString(),
        cancelledAt: x.cancelledAt,
        isAutoRenewEnabled: x.isInRetryBilling as boolean,
        isActive: x.isActive as boolean,
        isSandbox: false,
      };
    });
  }

  async getActiveSubscription(): Promise<PurchasedSubscriptionInfo | null> {
    const subscriptions = await this.getPurchasedSubscriptions();

    return subscriptions.find((x) => x.isActive) ?? null;
  }

  async getPurchasedProducts(): Promise<PurchasedProductInfo[]> {
    const purchases = await ApphudSdk.nonRenewingPurchases();

    return purchases.map((x) => ({
      productId: x.productId,
      purchasedAt: x.purchasedAt,
      canceledAt: x.canceledAt,
    }));
  }

  isProductPurchased(productId: string): Promise<boolean> {
    return ApphudSdk.isNonRenewingPurchaseActive(productId);
  }

  async restorePurchases() {
    if (Platform.OS === 'android') {
      await ApphudSdk.syncPurchases();
    }

    await ApphudSdk.restorePurchases();
  }

  async handlePurchase() {
    if (Platform.OS === 'android') {
      await ApphudSdk.syncPurchases();
    }
  }
}
