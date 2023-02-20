import type { ProductPurchase, SubscriptionPurchase } from 'react-native-iap';

import type { Purchase } from '../types/purchases';

export function buildPurchase(
  purchase: SubscriptionPurchase | ProductPurchase,
): Purchase {
  const ss = purchase as SubscriptionPurchase;

  ss;

  cancellationDate;
  return {
    productId: purchase.productId,
    transactionDate: purchase.transactionDate,
    transactionReceipt: purchase.transactionReceipt,
    purchaseToken: purchase.purchaseToken,
    originalPurchase: purchase,
  };
}
