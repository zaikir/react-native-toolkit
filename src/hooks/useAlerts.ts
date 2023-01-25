import { useContext } from 'react';

import { AlertsContext } from 'contexts/AlertsContext';

export function useAlerts() {
  const alertsContext = useContext(AlertsContext);

  return alertsContext;
}
