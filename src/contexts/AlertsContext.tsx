import PQueue from 'p-queue';
import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActionSheetIOS,
  Alert,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';

import { BlurView } from '../components/BlurView';
import { ControlledPromise, ThemeAlertConfig, useTheme } from '../index';

export type AlertsContextType = {
  showAlert: (name: string, props?: any) => Promise<any>;
  hideAlert: (name: string) => Promise<void>;
};

export type AlertsProviderProps = PropsWithChildren<object>;

export const AlertsContext = createContext<AlertsContextType>({} as any);

export function AlertsProvider({ children }: AlertsProviderProps) {
  const theme = useTheme();
  const [isActiveModalVisible, setIsActiveModalVisible] = useState(false);
  const alertsStack = useRef<(ThemeAlertConfig & { id: string })[]>([]);
  const activeAlertRef = useRef<(ThemeAlertConfig & { id: string }) | null>(
    null,
  );
  const activeAlertAwaiter = useRef<ControlledPromise<void> | null>(null);
  const alertsQueue = useRef<PQueue>(new PQueue({ concurrency: 1 }));

  const alertsDefinition: Record<string, ThemeAlertConfig> = theme.alerts;

  const dequeueAlert = useCallback(
    (alertDefinition: ThemeAlertConfig, id: string) => {
      return alertsQueue.current.add(async () => {
        if (activeAlertRef.current?.id !== id) {
          alertsStack.current = alertsStack.current.filter((x) => x.id !== id);
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
          if (
            'type' in activeAlertRef.current &&
            activeAlertRef.current.type === 'action-sheet'
          ) {
            // @ts-ignore
            ActionSheetIOS.showActionSheetWithOptions(...alertProps);
          } else {
            // @ts-ignore
            Alert.alert(...activeAlertRef.current.systemAlertProps);
          }
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
    },
    [],
  );

  const enqueueAlert = useCallback(
    (
      alert: ThemeAlertConfig,
      resolve: (value: any) => void,
      reject: (reason?: any) => void,
      props: any,
      name: string,
    ) => {
      return alertsQueue.current.add(async () => {
        if (activeAlertRef.current) {
          activeAlertAwaiter.current = new ControlledPromise<void>();

          setIsActiveModalVisible(false);

          await activeAlertAwaiter.current.wait();
          activeAlertAwaiter.current = null;
        }

        const id = name;
        const alertDefinition =
          typeof alert === 'function' ? alert(props ?? {}) : alert;

        if (!('component' in alertDefinition)) {
          const onButtonPress = (
            button: (typeof alertDefinition.buttons)[number],
          ) => {
            if (
              !button.onPress &&
              (!button.style ||
                button.style === 'default' ||
                button.style === 'destructive')
            ) {
              resolve(true);
              dequeueAlert(alertDefinition, id);
              return;
            }

            if (!button.onPress && button.style === 'cancel') {
              resolve(false);
              dequeueAlert(alertDefinition, id);
              return;
            }

            button?.onPress?.(resolve, reject);
            dequeueAlert(alertDefinition, id);
          };

          const alertProps =
            alertDefinition.type === 'action-sheet'
              ? ([
                  {
                    title: alertDefinition.title,
                    message: alertDefinition.message,
                    options: alertDefinition.buttons.map((x) => x.text),
                    cancelButtonIndex: (() => {
                      const index = alertDefinition.buttons.findIndex(
                        (x) => x.style === 'cancel',
                      );
                      return index === -1 ? undefined : index;
                    })(),
                    destructiveButtonIndex: (() => {
                      const index = alertDefinition.buttons.findIndex(
                        (x) => x.style === 'destructive',
                      );
                      return index === -1 ? undefined : index;
                    })(),
                  },
                  (buttonIndex: number) => {
                    onButtonPress(alertDefinition.buttons[buttonIndex]);
                  },
                ] as const)
              : ([
                  alertDefinition.title,
                  alertDefinition.message,
                  alertDefinition.buttons?.length
                    ? alertDefinition.buttons.map((button) => ({
                        style: button.style,
                        text: button.text,
                        onPress: () => {
                          onButtonPress(button);
                        },
                      }))
                    : [
                        {
                          text: 'OK',
                          onPress: () => {
                            onButtonPress({ text: 'OK' });
                          },
                        },
                      ],
                  {
                    cancelable: false,
                  },
                ] as const);

          alertsStack.current = [
            ...alertsStack.current,
            {
              ...alertDefinition,
              ...({ systemAlertProps: alertProps } as any),
              id,
            },
          ];

          activeAlertRef.current =
            alertsStack.current[alertsStack.current.length - 1];

          if (alertDefinition.type === 'action-sheet') {
            // @ts-ignore
            ActionSheetIOS.showActionSheetWithOptions(...alertProps);
          } else {
            // @ts-ignore
            Alert.alert(...alertProps);
          }
        } else {
          if (!alertDefinition.type || alertDefinition.type === 'modal') {
            alertsStack.current = [
              ...alertsStack.current,
              {
                ...alertDefinition,
                id,
                component: () => (
                  <alertDefinition.component
                    resolve={(value: any) => {
                      resolve(value);
                      dequeueAlert(alertDefinition, id);
                    }}
                    reject={(value: any) => {
                      reject(value);
                      dequeueAlert(alertDefinition, id);
                    }}
                    options={{
                      ...alertDefinition.componentProps,
                      ...props,
                    }}
                  />
                ),
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
        enqueueAlert(alertDefinition, resolve, reject, props ?? {}, name);
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

      await dequeueAlert(alertDefinition, name);
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
              backdropColor={
                activeAlertRef.current.modalProps?.blurType
                  ? undefined
                  : activeAlertRef.current.modalProps?.backdropColor
              }
              backdropOpacity={
                activeAlertRef.current.modalProps?.blurType
                  ? 1
                  : activeAlertRef.current.modalProps?.backdropOpacity
              }
              customBackdrop={
                activeAlertRef.current?.modalProps?.customBackdrop ??
                (activeAlertRef.current.modalProps?.blurType
                  ? (() => {
                      const content = (
                        <BlurView
                          {...activeAlertRef.current.modalProps?.blurProps}
                          animated={
                            activeAlertRef.current.modalProps?.blurProps
                              ?.animated ?? true
                          }
                          blurAmount={
                            activeAlertRef.current.modalProps?.blurProps
                              ?.blurAmount ?? 20
                          }
                          enteringAnimationDuration={
                            activeAlertRef.current.modalProps?.blurProps
                              ?.enteringAnimationDuration ?? 200
                          }
                          blurType={
                            activeAlertRef.current.modalProps?.blurType ??
                            (Platform.OS === 'ios' ? 'transparent' : 'dark')
                          }
                          style={[
                            { flex: 1 },
                            activeAlertRef.current.modalProps?.blurProps?.style,
                          ]}
                        />
                      );

                      if (
                        !activeAlertRef.current?.modalProps?.onBackdropPress
                      ) {
                        return content;
                      }

                      return (
                        <TouchableOpacity
                          activeOpacity={1}
                          onPress={
                            activeAlertRef.current.modalProps.onBackdropPress
                          }
                          style={{ flex: 1 }}
                        >
                          {content}
                        </TouchableOpacity>
                      );
                    })()
                  : undefined)
              }
              animationIn={
                activeAlertRef.current.modalProps?.animationIn ?? 'bounceIn'
              }
              animationOut={
                activeAlertRef.current.modalProps?.animationOut ?? 'zoomOut'
              }
              animationOutTiming={
                activeAlertRef.current.modalProps?.animationOutTiming ?? 100
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
                activeAlertRef?.current?.modalProps?.onModalHide?.();
              }}
              onModalShow={() => {
                activeAlertAwaiter.current!.resolve();
                // @ts-ignore
                activeAlertRef?.current?.modalProps?.onModalShow?.();
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
                pointerEvents="box-none"
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
