import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';

import { PluginsBundleContext } from './PluginsBundleContext';
import {
  IAppPurchasePlugin,
  Product,
  Purchase,
  PurchasedSubscriptionInfo,
  Subscription,
} from '../plugins/types';
import { waitUntil } from '../utils/promise/waitUntil';
import type { FunctionWrapper, GenericFunction } from '../utils/types';

export type InAppPurchaseContextType = {
  isInitialized: boolean;
  products: Product[];
  subscriptions: Subscription[];
  hasPremiumAccess: boolean;
  activeSubscription: (PurchasedSubscriptionInfo & Subscription) | null;
  restorePurchases: () => Promise<boolean>;
  purchaseProduct: (productId: string) => Promise<Purchase | null>;
  purchasePremium: (productId: string) => Promise<Purchase | null>;
  premiumAccess: <F extends GenericFunction>(func: F) => FunctionWrapper<F>;
};

export const InAppPurchaseContext = createContext<InAppPurchaseContextType>(
  {} as any,
);

export function InAppPurchaseProvider({ children }: PropsWithChildren<object>) {
  const [isInitialized, setIsInitialized] = useState(false);
  const { bundle } = useContext(PluginsBundleContext);
  const iapPurchasePlugin = useMemo(() => {
    return bundle.getByFeature<IAppPurchasePlugin>('InAppPurchase');
  }, [bundle]);
  const [activeSubscription, setActiveSubscription] = useState<
    (PurchasedSubscriptionInfo & Subscription) | null
  >(null);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const lastUserDataFetchTimestamp = useRef(new Date().valueOf());

  const fetchUserData = useCallback(async () => {
    if (!iapPurchasePlugin) {
      throw new Error('IAP is not initialized');
    }

    const results = await Promise.all([
      iapPurchasePlugin.receiptValidator.hasPremiumAccess(),
      iapPurchasePlugin.receiptValidator.getActiveSubscription(),
    ]);

    setHasPremiumAccess(results[0]);

    const subscriptionInstance =
      results[1] &&
      new Subscription(
        iapPurchasePlugin.subscriptions.find(
          (x) => x.productId === results[1]?.productId,
        )!,
      );

    setActiveSubscription(
      subscriptionInstance && results[1]
        ? {
            ...subscriptionInstance,
            ...results[1],
            formatPrice(options) {
              return subscriptionInstance.formatPrice(options);
            },
          }
        : null,
    );

    setIsInitialized(true);

    lastUserDataFetchTimestamp.current = new Date().valueOf();

    return results[0];
  }, [iapPurchasePlugin]);

  const restorePurchases = useCallback(async () => {
    if (!iapPurchasePlugin) {
      throw new Error('IAP is not initialized');
    }

    await iapPurchasePlugin.receiptValidator.restorePurchases();
    return fetchUserData();
  }, [iapPurchasePlugin]);

  const purchaseProduct = useCallback(
    async (productId: string) => {
      if (!iapPurchasePlugin) {
        throw new Error('IAP plugin not found');
      }

      try {
        const purchase = await iapPurchasePlugin.purchaseProduct(productId);
        return purchase;
      } catch (err) {
        const error = err as {
          isCancelled: boolean;
          message: string;
        };

        if (error.isCancelled) {
          return null;
        }

        throw new Error(error.message);
      }
    },
    [iapPurchasePlugin],
  );

  const purchasePremium = useCallback(
    async (productId: string) => {
      const purchase = await purchaseProduct(productId);
      if (!purchase) {
        return null;
      }

      await waitUntil(async () => {
        await iapPurchasePlugin!.receiptValidator.restorePurchases();
        return await fetchUserData();
      });
      await iapPurchasePlugin!.refetchProducts();

      return purchase;
    },
    [purchaseProduct, iapPurchasePlugin],
  );

  const premiumAccess = useCallback(
    <F extends GenericFunction>(func: F): FunctionWrapper<F> => {
      return async (...args) => {
        let isAllowed = hasPremiumAccess;

        if (
          new Date().valueOf() - lastUserDataFetchTimestamp.current >
          1000 * 60 * 60
        ) {
          isAllowed = await restorePurchases();
        }

        if (!isAllowed) {
          throw new Error('Premium access required');
        }

        return func(...args);
      };
    },
    [hasPremiumAccess, fetchUserData, restorePurchases],
  );

  const contextData = useMemo<InAppPurchaseContextType>(
    () => ({
      isInitialized,
      hasPremiumAccess,
      activeSubscription,
      products: iapPurchasePlugin?.products ?? [],
      subscriptions: iapPurchasePlugin?.subscriptions ?? [],
      restorePurchases,
      purchaseProduct,
      purchasePremium,
      premiumAccess,
    }),
    [
      isInitialized,
      iapPurchasePlugin,
      hasPremiumAccess,
      activeSubscription,
      restorePurchases,
      purchaseProduct,
      purchasePremium,
      premiumAccess,
    ],
  );

  useEffect(() => {
    if (!iapPurchasePlugin) {
      return;
    }

    fetchUserData();
  }, [iapPurchasePlugin]);

  return (
    <InAppPurchaseContext.Provider value={contextData}>
      {children}
    </InAppPurchaseContext.Provider>
  );
}
