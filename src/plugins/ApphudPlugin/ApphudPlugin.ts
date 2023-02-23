import ApphudSdk, { type StartProperties } from '@kirz/react-native-apphud';

import { Plugin, PluginFeature } from 'plugins/Plugin';
import type {
  IReceiptValidator,
  PurchasedProductInfo,
  PurchasedSubscriptionInfo,
} from 'plugins/types';

export class ApphudPlugin extends Plugin implements IReceiptValidator {
  readonly name = 'ApphudPlugin';
  readonly features: PluginFeature[] = ['IAPReceiptValidator'];
  readonly initializationTimeout = 5000;

  constructor(readonly options: Omit<StartProperties, 'observerMode'>) {
    super();
  }

  async initialize() {
    await ApphudSdk.start({ ...this.options, observerMode: true });
  }

  async isTrialAvailable(subscriptionId: string): Promise<boolean> {
    return await ApphudSdk.checkEligibilitiesForIntroductoryOffer(
      subscriptionId,
    );
  }

  async hasPremiumAccess(): Promise<boolean> {
    return await ApphudSdk.hasPremiumAccess();
  }

  async hasActiveSubscription(): Promise<boolean> {
    return await ApphudSdk.hasActiveSubscription();
  }

  async getPurchasedSubscriptions(): Promise<PurchasedSubscriptionInfo[]> {
    const subscriptions = await ApphudSdk.subscriptions();

    return subscriptions.map((x) => ({
      productId: x.productId,
      expiresAt: x.expiresAt,
      startedAt: x.startedAt,
      cancelledAt: x.cancelledAt,
      isAutoRenewEnabled: x.isAutoRenewEnabled as boolean,
      isActive: x.isActive as boolean,
    }));
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
    await ApphudSdk.restorePurchases();
  }
}
