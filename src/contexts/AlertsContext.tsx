import PQueue from 'p-queue';
import React, {
  FunctionComponent,
  PropsWithChildren,
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert, View } from 'react-native';
import Modal from 'react-native-modal';

import { ControlledPromise, ThemeAlertConfig, useTheme } from 'index';

export type AlertsContextType = {
  showAlert: (name: string, props?: any) => Promise<any>;
};

export type AlertsProviderProps = PropsWithChildren<object>;

export const AlertsContext = createContext<AlertsContextType>({} as any);

export function AlertsProvider({ children }: AlertsProviderProps) {
  const theme = useTheme();
  const [isActiveModalVisible, setIsActiveModalVisible] = useState(false);
  const alertsStack = useRef<FunctionComponent[]>([]);
  const activeAlertRef = useRef<FunctionComponent | null>(null);
  const activeAlertAwaiter = useRef<ControlledPromise<void> | null>(null);
  const alertsQueue = useRef<PQueue>(new PQueue({ concurrency: 1 }));
  // const [activeAlert, setActiveAlert] = useState<FunctionComponent | null>(
  //   null,
  // );

  const alertsDefinition: Record<string, ThemeAlertConfig> = theme.alerts;
  // const ActiveAlert = alerts.

  const showCustomAlert = useCallback(async (Component: FunctionComponent) => {
    alertsStack.current = [...alertsStack.current, Component];

    if (activeAlertRef.current) {
      activeAlertAwaiter.current = new ControlledPromise<void>();

      setIsActiveModalVisible(false);

      await activeAlertAwaiter.current.wait();
      activeAlertAwaiter.current = null;
    }

    activeAlertAwaiter.current = new ControlledPromise<void>();

    activeAlertRef.current = Component;
    setIsActiveModalVisible(true);

    await activeAlertAwaiter.current.wait();
    activeAlertAwaiter.current = null;

    setIsActiveModalVisible(false);
  }, []);

  const showAlert = useCallback<AlertsContextType['showAlert']>(
    async (name: string, props?: any) => {
      const alertDefinition = alertsDefinition[name];
      if (!alertDefinition) {
        throw new Error(`Alert "${name}" is not registered`);
      }

      return new Promise<any>((resolve, reject) => {
        if ('component' in alertDefinition) {
          showCustomAlert(() => (
            <alertDefinition.component resolve={resolve} reject={reject} />
          ));
          return;
        }

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
        );
      });
    },
    [alertsDefinition, showCustomAlert],
  );

  /*
  // showAlert
  1. add modal to stack
  2. hide active if any
  3. wait until it hides
  4. unmount previous modal, mount new one
  5. wait until it shows???
  6. ready

  // alert resolved/rejected/dismissed
  1. hide active modal
  2. wait until it hides
  3. show next modal if any ["showAlert" flow from 4]
  */

  // useEffect(() => {
  //   setActiveAlert(alerts[alerts.length - 1]);
  // }, [alerts]);

  const contextData = useMemo(
    () => ({
      showAlert,
    }),
    [],
  );

  return (
    <AlertsContext.Provider value={contextData}>
      {children}

      <Modal
        isVisible={isActiveModalVisible}
        animationIn="bounceIn"
        animationOut="zoomOut"
        useNativeDriverForBackdrop
        avoidKeyboard
        coverScreen={false}
        onModalHide={() => {
          activeAlertAwaiter.current!.resolve();
        }}
        onModalShow={() => {
          activeAlertAwaiter.current!.resolve();
        }}
        style={{ margin: 0 }}
        backdropTransitionOutTiming={0}
      >
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          {activeAlertRef.current && <activeAlertRef.current />}
        </View>
      </Modal>
    </AlertsContext.Provider>
  );
}
