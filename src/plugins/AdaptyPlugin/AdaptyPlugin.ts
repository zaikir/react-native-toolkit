import {
  ActivateParamsInput,
  AdaptyPaywall,
  AdaptyPaywallProduct,
  adapty,
} from 'react-native-adapty';

import { Plugin, PluginFeature } from '../Plugin';
import type {
  IReceiptValidator,
  IRemoteConfigPlugin,
  PurchasedProductInfo,
  PurchasedSubscriptionInfo,
  RemoteConfig,
} from '../types';

export class AdaptyPlugin
  extends Plugin
  implements IReceiptValidator, IRemoteConfigPlugin
{
  readonly name = 'AdaptyPlugin';
  readonly features: PluginFeature[] = ['IAPReceiptValidator', 'RemoteConfig'];
  readonly initializationTimeout = 15000;

  readonly premiumAccessLevelKey: string;

  paywall?: AdaptyPaywall;
  products?: AdaptyPaywallProduct[];

  _remoteConfig: RemoteConfig;

  get remoteValues() {
    return this._remoteConfig;
  }

  constructor(
    readonly options: Omit<ActivateParamsInput, 'observerMode'> & {
      apiKey: string;
      remoteConfig?: RemoteConfig;
      paywallId?: string;
      premiumAccessLevelKey?: string;
    },
  ) {
    super();

    this._remoteConfig = options.remoteConfig ?? {};
    this.premiumAccessLevelKey = options?.premiumAccessLevelKey ?? 'premium';
  }

  async initialize() {
    await adapty.activate(this.options.apiKey, this.options);
    this.paywall = await adapty.getPaywall(
      this.options.paywallId ?? 'placement-1',
    );

    this.products = await adapty.getPaywallProducts(this.paywall);

    // @ts-ignore
    this._remoteConfig = this.paywall.remoteConfig;
  }

  async isTrialAvailable(subscriptionId: string): Promise<boolean> {
    const product = this.products?.find(
      (x) => x.vendorProductId === subscriptionId,
    );
    if (!product) {
      throw new Error(`Product ${subscriptionId} not found`);
    }

    const { [subscriptionId]: result } =
      await adapty.getProductsIntroductoryOfferEligibility([product]);

    return result === 'eligible';
  }

  async hasPremiumAccess(): Promise<boolean> {
    const profile = await adapty.getProfile();
    const premiumAccessLevel =
      profile.accessLevels?.[this.premiumAccessLevelKey];

    return !!premiumAccessLevel?.isActive;
  }

  async hasActiveSubscription(): Promise<boolean> {
    return this.hasPremiumAccess();
  }

  async getPurchasedSubscriptions(): Promise<PurchasedSubscriptionInfo[]> {
    const profile = await adapty.getProfile();

    return Object.values(profile.subscriptions ?? {}).map((value) => ({
      productId: value.vendorProductId,
      expiresAt: value.expiresAt?.toISOString() as any,
      isActive: value.isActive,
      isAutoRenewEnabled: value.willRenew,
      isSandbox: value.isSandbox,
      startedAt: value.startsAt?.toISOString() as any,
      cancelledAt: value.unsubscribedAt?.toISOString(),
    }));
  }

  async getActiveSubscription(): Promise<PurchasedSubscriptionInfo | null> {
    const subscriptions = await this.getPurchasedSubscriptions();

    return subscriptions.find((x) => x.isActive) ?? null;
  }

  async getPurchasedProducts(): Promise<PurchasedProductInfo[]> {
    const profile = await adapty.getProfile();

    return Object.values(profile.nonSubscriptions ?? {})
      .flatMap((x) => x)
      .map((x) => ({
        productId: x.vendorProductId,
        purchasedAt: x.purchasedAt.toISOString(),
        canceledAt: x.isRefund ? x.purchasedAt.toISOString() : undefined,
      }));
  }

  async isProductPurchased(productId: string): Promise<boolean> {
    const profile = await adapty.getProfile();

    return !!profile.nonSubscriptions?.[productId];
  }

  async restorePurchases() {
    await adapty.restorePurchases();
  }

  async handlePurchase() {
    // no-op
  }
}
