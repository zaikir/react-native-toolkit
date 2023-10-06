import { useCallback, useContext } from 'react';

import { AlertsContext } from 'contexts/AlertsContext';
import { Alert } from 'theme';

export function useAlert(name: Alert) {
  const { showAlert: showAlertBase, hideAlert: hideAlertBase } =
    useContext(AlertsContext);

  const showAlert = useCallback(
    (props?: any) => {
      return showAlertBase(name, props);
    },
    [name, showAlertBase],
  );

  const hideAlert = useCallback(() => {
    return hideAlertBase(name);
  }, [name, hideAlertBase]);

  return {
    showAlert,
    hideAlert,
  };
}
