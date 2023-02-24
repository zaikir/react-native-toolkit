import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { PluginsBundleContext } from 'contexts/PluginsBundleContext/PluginsBundleContext';
import type {
  IAppPurchasePlugin,
  Product,
  PurchasedSubscriptionInfo,
  Subscription,
} from 'plugins/types';

export type InAppPurchaseContextType = {
  products: Product[];
  subscriptions: Subscription[];
  hasPremiumAccess: boolean;
  activeSubscription: (PurchasedSubscriptionInfo & Subscription) | null;
  restorePurchases: () => Promise<boolean>;
  purchaseProduct: (productId: string) => Promise<void>;
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

  const fetchUserData = async () => {
    if (!iapPurchasePlugin) {
      throw new Error('IAP plugin not found');
    }

    const results = await Promise.all([
      iapPurchasePlugin.receiptValidator.hasPremiumAccess(),
      iapPurchasePlugin.receiptValidator.getActiveSubscription(),
    ]);

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

  const contextData = useMemo<InAppPurchaseContextType>(
    () => ({
      hasPremiumAccess,
      activeSubscription,
      products: iapPurchasePlugin?.products ?? [],
      subscriptions: iapPurchasePlugin?.subscriptions ?? [],
      restorePurchases,
      purchaseProduct,
    }),
    [
      iapPurchasePlugin,
      hasPremiumAccess,
      activeSubscription,
      restorePurchases,
      purchaseProduct,
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
