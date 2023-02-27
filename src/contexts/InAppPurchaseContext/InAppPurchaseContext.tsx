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

import { PluginsBundleContext } from 'contexts/PluginsBundleContext/PluginsBundleContext';
import type {
  IAppPurchasePlugin,
  Product,
  PurchasedSubscriptionInfo,
  Subscription,
} from 'plugins/types';
import { waitUntil } from 'utils/promise/waitUntil';
import type { FunctionWrapper, GenericFunction } from 'utils/types';

export type InAppPurchaseContextType = {
  products: Product[];
  subscriptions: Subscription[];
  hasPremiumAccess: boolean;
  activeSubscription: (PurchasedSubscriptionInfo & Subscription) | null;
  restorePurchases: () => Promise<boolean>;
  purchaseProduct: (productId: string) => Promise<void>;
  purchasePremium: (productId: string) => Promise<void>;
  premiumAccess: <F extends GenericFunction>(func: F) => FunctionWrapper<F>;
};

export const InAppPurchaseContext = createContext<InAppPurchaseContextType>(
  {} as any,
);

export function InAppPurchaseProvider({ children }: PropsWithChildren<object>) {
  const { bundle } = useContext(PluginsBundleContext);
  const iapPurchasePlugin =
    bundle.getByFeature<IAppPurchasePlugin>('InAppPurchase');
  const [activeSubscription, setActiveSubscription] = useState<
    (PurchasedSubscriptionInfo & Subscription) | null
  >(null);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const lastUserDataFetchTimestamp = useRef(new Date().valueOf());

  const fetchUserData = async () => {
    if (!iapPurchasePlugin) {
      throw new Error('IAP plugin not found');
    }

    const results = await Promise.all([
      iapPurchasePlugin.receiptValidator.hasPremiumAccess(),
      iapPurchasePlugin.receiptValidator.getActiveSubscription(),
    ]);

    console.log('fetchUserData', { results });

    setHasPremiumAccess(results[0]);
    setActiveSubscription(
      results[1]
        ? {
            ...iapPurchasePlugin.subscriptions.find(
              (x) => x.productId === results[1]?.productId,
            )!,
            ...results[1],
          }
        : null,
    );

    lastUserDataFetchTimestamp.current = new Date().valueOf();

    return results[0];
  };

  const restorePurchases = useCallback(async () => {
    if (!iapPurchasePlugin) {
      throw new Error('IAP plugin not found');
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
        await iapPurchasePlugin.purchaseProduct(productId);
        console.log('purchased');
      } catch (err) {
        const error = err as {
          isCancelled: boolean;
          message: string;
        };

        if (error.isCancelled) {
          return;
        }

        throw new Error(error.message);
      }

      await fetchUserData();
      await iapPurchasePlugin.refetchProducts();
    },
    [iapPurchasePlugin],
  );

  const purchasePremium = useCallback(
    async (productId: string) => {
      await purchaseProduct(productId);

      await waitUntil(() => fetchUserData());
      await iapPurchasePlugin!.refetchProducts();
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
