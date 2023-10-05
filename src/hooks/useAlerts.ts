import { useContext } from 'react';

import { AlertsContext } from 'contexts/AlertsContext';

export function useAlerts() {
  return useContext(AlertsContext);
}
