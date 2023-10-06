import PQueue from 'p-queue';
import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert, View } from 'react-native';
import Modal from 'react-native-modal';

import { ControlledPromise, ThemeAlertConfig, useTheme } from 'index';

export type AlertsContextType = {
  showAlert: (name: string, props?: any) => Promise<any>;
  hideAlert: (name: string) => Promise<void>;
};

export type AlertsProviderProps = PropsWithChildren<object>;

export const AlertsContext = createContext<AlertsContextType>({} as any);

export function AlertsProvider({ children }: AlertsProviderProps) {
  const theme = useTheme();
  const [isActiveModalVisible, setIsActiveModalVisible] = useState(false);
  const alertsStack = useRef<ThemeAlertConfig[]>([]);
  const activeAlertRef = useRef<ThemeAlertConfig | null>(null);
  const activeAlertAwaiter = useRef<ControlledPromise<void> | null>(null);
  const alertsQueue = useRef<PQueue>(new PQueue({ concurrency: 1 }));

  const alertsDefinition: Record<string, ThemeAlertConfig> = theme.alerts;

  const dequeueAlert = useCallback((alertDefinition: ThemeAlertConfig) => {
    return alertsQueue.current.add(async () => {
      if (activeAlertRef.current !== alertDefinition) {
        alertsStack.current = alertsStack.current.filter(
          (x) => x !== alertDefinition,
        );
        return;
      }

      if (!('component' in alertDefinition)) {
        // can't hide system alert
        alertsStack.current.pop();
      } else {
        activeAlertAwaiter.current = new ControlledPromise<void>();

        setIsActiveModalVisible(false);

        await activeAlertAwaiter.current.wait();
        activeAlertAwaiter.current = null;
      }

      alertsStack.current.pop();
      activeAlertRef.current =
        alertsStack.current[alertsStack.current.length - 1] ?? null;

      if (!activeAlertRef.current) {
        return;
      }

      if (!('component' in activeAlertRef.current)) {
        // @ts-ignore
        Alert.alert(activeAlertRef.current.systemAlertProps);
      } else {
        if (
          !activeAlertRef.current.type ||
          activeAlertRef.current.type === 'modal'
        ) {
          activeAlertAwaiter.current = new ControlledPromise<void>();

          setIsActiveModalVisible(true);

          await activeAlertAwaiter.current.wait();
          activeAlertAwaiter.current = null;
        }
      }
    });
  }, []);

  const enqueueAlert = useCallback(
    (
      alertDefinition: ThemeAlertConfig,
      resolve: (value: any) => void,
      reject: (reason?: any) => void,
      props?: any,
    ) => {
      return alertsQueue.current.add(async () => {
        if (activeAlertRef.current) {
          activeAlertAwaiter.current = new ControlledPromise<void>();

          setIsActiveModalVisible(false);

          await activeAlertAwaiter.current.wait();
          activeAlertAwaiter.current = null;
        }

        if (!('component' in alertDefinition)) {
          const alertProps = [
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
                  dequeueAlert(alertDefinition);
                  return;
                }

                if (!button.onPress && button.style === 'cancel') {
                  resolve(false);
                  dequeueAlert(alertDefinition);
                  return;
                }

                button?.onPress?.(resolve, reject);
              },
            })) ?? [],
            {
              cancelable: alertDefinition.cancelable,
              onDismiss() {
                resolve(false);
                dequeueAlert(alertDefinition);
              },
            },
          ] as const;

          alertsStack.current = [
            ...alertsStack.current,
            {
              ...alertDefinition,
              ...({ systemAlertProps: alertProps } as any),
            },
          ];
          activeAlertRef.current = alertDefinition;

          Alert.alert(...alertProps);
        } else {
          if (!alertDefinition.type || alertDefinition.type === 'modal') {
            alertsStack.current = [
              ...alertsStack.current,
              {
                ...alertDefinition,
                component: () => (
                  <alertDefinition.component
                    resolve={resolve}
                    reject={reject}
                    {...props}
                  />
                ),
                // @ts-ignore
                onDismiss() {
                  resolve(false);
                },
              },
            ];

            activeAlertAwaiter.current = new ControlledPromise<void>();

            activeAlertRef.current =
              alertsStack.current[alertsStack.current.length - 1];

            setIsActiveModalVisible(true);

            await activeAlertAwaiter.current.wait();
            activeAlertAwaiter.current = null;
          }
        }
      });
    },
    [dequeueAlert],
  );

  const showAlert = useCallback<AlertsContextType['showAlert']>(
    async (name: string, props?: any) => {
      const alertDefinition = alertsDefinition[name];
      if (!alertDefinition) {
        throw new Error(`Alert "${name}" is not registered`);
      }

      return new Promise<any>((resolve, reject) => {
        enqueueAlert(alertDefinition, resolve, reject, props);
      });
    },
    [alertsDefinition, enqueueAlert],
  );

  const hideAlert = useCallback<AlertsContextType['hideAlert']>(
    async (name: string) => {
      const alertDefinition = alertsDefinition[name];
      if (!alertDefinition) {
        throw new Error(`Alert "${name}" is not registered`);
      }

      await dequeueAlert(alertDefinition);
    },
    [alertsDefinition, enqueueAlert],
  );

  const contextData = useMemo(
    () => ({
      showAlert,
      hideAlert,
    }),
    [showAlert, hideAlert],
  );

  return (
    <AlertsContext.Provider value={contextData}>
      {children}

      {(() => {
        if (!activeAlertRef.current) {
          return null;
        }

        if (!('component' in activeAlertRef.current)) {
          return null;
        }

        if (
          !activeAlertRef.current.type ||
          activeAlertRef.current.type === 'modal'
        ) {
          return (
            <Modal
              {...activeAlertRef.current.modalProps}
              isVisible={isActiveModalVisible}
              animationIn={
                activeAlertRef.current.modalProps?.animationIn ?? 'bounceIn'
              }
              animationOut={
                activeAlertRef.current.modalProps?.animationOut ?? 'zoomOut'
              }
              useNativeDriverForBackdrop={
                activeAlertRef.current.modalProps?.useNativeDriverForBackdrop ??
                true
              }
              avoidKeyboard={
                activeAlertRef.current.modalProps?.avoidKeyboard ?? true
              }
              onModalHide={() => {
                activeAlertAwaiter.current!.resolve();
                // @ts-ignore
                activeAlertRef?.current?.modalProps?.onModalHide();
              }}
              onModalShow={() => {
                activeAlertAwaiter.current!.resolve();
                // @ts-ignore
                activeAlertRef?.current?.modalProps?.onModalShow();
              }}
              onDismiss={() => {
                // @ts-ignore
                activeAlertRef?.current?.onDismiss();
                // @ts-ignore
                activeAlertRef?.current?.modalProps?.onDismiss();
              }}
              style={[
                { margin: 0 },
                activeAlertRef?.current?.modalProps?.style,
              ]}
              backdropTransitionOutTiming={
                activeAlertRef?.current?.modalProps
                  ?.backdropTransitionOutTiming ?? 0
              }
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {activeAlertRef.current?.component && (
                  <activeAlertRef.current.component {...({} as any)} />
                )}
              </View>
            </Modal>
          );
        }

        return null;
      })()}
    </AlertsContext.Provider>
  );
}
