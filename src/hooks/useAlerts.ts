import { AlertsContext } from 'contexts/AlertsContext';
import { useContext } from 'react';

export default function useAlerts() {
  const alertsContext = useContext(AlertsContext);

  return alertsContext;
}
