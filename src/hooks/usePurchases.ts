import { useContext } from 'react';

import { InAppPurchaseContext } from 'contexts/InAppPurchaseContext/InAppPurchaseContext';

export function usePurchases() {
  const contextData = useContext(InAppPurchaseContext);

  return contextData;
}
