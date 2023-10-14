import React, {
  createContext,
  PropsWithChildren,
  useMemo,
  useRef,
} from 'react';
import DropdownAlert, {
  DropdownAlertData,
  DropdownAlertType,
} from 'react-native-dropdownalert';

export type DropDownContextType = {
  showDropdown: (
    type: DropdownAlertType,
    title?: string,
    text?: string,
  ) => void;
};

export const DropDownContext = createContext<DropDownContextType>({} as any);

export function DropDownProvider({ children }: PropsWithChildren<object>) {
  const alertRef =
    useRef<(_data: DropdownAlertData) => Promise<DropdownAlertData>>();

  const contextData = useMemo<DropDownContextType>(
    () => ({
      showDropdown: (type, title, text) => {
        if (!alertRef.current) {
          return;
        }

        alertRef.current({
          type,
          title,
          message: text,
        });
      },
    }),
    [],
  );

  return (
    <DropDownContext.Provider value={contextData}>
      {children}
      <DropdownAlert
        alert={(func) => (alertRef.current = func)}
        updateStatusBar={false}
      />
    </DropDownContext.Provider>
  );
}
