import React, {
  PropsWithChildren,
  ReactNode,
  createContext,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { Alert } from 'react-native';

import { AlertComponentProps, ThemeAlertConfig, useTheme } from 'index';

export type AlertsContextType = {
  showAlert: (name: string, props?: any) => Promise<any>;
};

export type AlertProviderProps = PropsWithChildren<object>;

export const AlertsContext = createContext<AlertsContextType>({} as any);

export function AlertProvider({ children }: AlertProviderProps) {
  const theme = useTheme();
  const [, setAlerts] = useState<
    {
      Component: (props: AlertComponentProps) => ReactNode;
      props?: any;
    }[]
  >([]);

  const alertsDefinition: Record<string, ThemeAlertConfig> = theme.alerts;

  const showAlert = useCallback<AlertsContextType['showAlert']>(
    async (name: string, props?: any) => {
      const alertDefinition = alertsDefinition[name];
      if (!alertDefinition) {
        throw new Error(`Alert "${name}" is not registered`);
      }

      if ('component' in alertDefinition) {
        setAlerts((prev) => [
          ...prev,
          {
            Component: alertDefinition.component,
            props,
          },
        ]);

        return;
      }

      return new Promise<any>((resolve, reject) =>
        Alert.alert(
          alertDefinition.title,
          alertDefinition.message,
          alertDefinition.buttons.map((button) => ({
            style: button.style,
            text: button.text,
            onPress: () => {
              if (
                !button.onPress &&
                (!button.style ||
                  button.style === 'default' ||
                  button.style === 'destructive')
              ) {
                resolve(true);
                return;
              }

              if (!button.onPress && button.style === 'cancel') {
                resolve(false);
                return;
              }

              button?.onPress?.(resolve, reject);
            },
          })) ?? [],
          ...(props ?? {}),
        ),
      );
    },
    [alertsDefinition],
  );

  const contextData = useMemo(
    () => ({
      showAlert,
    }),
    [],
  );

  return (
    <AlertsContext.Provider value={contextData}>
      {children}
    </AlertsContext.Provider>
  );
}
