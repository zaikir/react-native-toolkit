import { AlertsContext } from 'contexts/AlertsContext';
import { useContext } from 'react';

export function useAlerts() {
  const alertsContext = useContext(AlertsContext);

  return alertsContext;
}
