import { useCallback, useContext } from 'react';

import { AlertsContext } from 'contexts/AlertsContext';
import { Alert } from 'theme';

export function useAlert() {
  const { showAlert: showAlertBase, hideAlert: hideAlertBase } =
    useContext(AlertsContext);

  const showAlert = useCallback(
    (name: Alert, props?: any) => {
      return showAlertBase(name, props);
    },
    [showAlertBase],
  );

  const hideAlert = useCallback(
    (name: Alert) => {
      return hideAlertBase(name);
    },
    [hideAlertBase],
  );

  return {
    showAlert,
    hideAlert,
  };
}
