import React, {
  createContext, PropsWithChildren, useMemo, useRef,
} from 'react';
import DropdownAlert from 'react-native-dropdownalert';

export type AlertsContextType = {
  showAlert: DropdownAlert['alertWithType'],
  hideAlert: DropdownAlert['closeAction'],
};

export const AlertsContext = createContext<AlertsContextType>({} as any);

export function AlertsProvider({
  children,
}: PropsWithChildren<{}>) {
  const dropdownRef = useRef<DropdownAlert>();

  const contextData = useMemo<AlertsContextType>(() => ({
    showAlert: (...args) => {
      if (dropdownRef.current.getQueueSize() > 0) {
        dropdownRef.current.closeAction('programmatic', () => {
          dropdownRef.current.alertWithType(...args);
        });
      } else {
        dropdownRef.current.alertWithType(...args);
      }
    },
    hideAlert: (...args) => dropdownRef.current.closeAction(...args),
  }), []);

  return (
    <AlertsContext.Provider value={contextData}>
      {children}
      <DropdownAlert
        updateStatusBar={false}
        isInteraction={false}
        ref={(ref) => {
          dropdownRef.current = ref;
        }}
      />
    </AlertsContext.Provider>
  );
}
