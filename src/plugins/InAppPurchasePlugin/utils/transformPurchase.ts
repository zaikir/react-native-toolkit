import type { Purchase as IapPurchase } from 'react-native-iap';

import type { Purchase } from '../../types';

export function transformPurchase(purchase: IapPurchase): Purchase {
  return {
    productId: purchase.productId,
    transactionDate: new Date(purchase.transactionDate).toISOString(),
    transactionReceipt: purchase.transactionReceipt,
    originalData: purchase,
  };
}
