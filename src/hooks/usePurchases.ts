import { useContext } from 'react';

import { InAppPurchaseContext } from 'contexts/InAppPurchaseContext';

export function usePurchases() {
  const contextData = useContext(InAppPurchaseContext);

  return contextData;
}
