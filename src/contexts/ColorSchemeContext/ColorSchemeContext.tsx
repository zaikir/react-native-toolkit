import React, {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useMemo,
  useState,
} from 'react';
import { StatusBar, useColorScheme, StatusBarProps } from 'react-native';

export type ColorScheme = 'light' | 'dark';

export type ColorSchemeContextType = {
  colorScheme: ColorScheme;
  setColorScheme: Dispatch<SetStateAction<ColorScheme | null>>;
};

export const ColorSchemeContext = createContext<ColorSchemeContextType>(
  {} as any,
);

export function ColorSchemeProvider({
  scheme,
  children,
  statusBarProps,
}: PropsWithChildren<{
  scheme?: ColorScheme;
  statusBarProps?: StatusBarProps;
}>) {
  const systemColorScheme = useColorScheme();
  const [fixedScheme, setFixedScheme] = useState<ColorScheme | null>(
    scheme || null,
  );

  const contextData = useMemo<ColorSchemeContextType>(
    () => ({
      colorScheme: fixedScheme || systemColorScheme || 'light',
      setColorScheme: setFixedScheme,
    }),
    [systemColorScheme, fixedScheme],
  );

  return (
    <ColorSchemeContext.Provider value={contextData}>
      <StatusBar
        {...statusBarProps}
        barStyle={
          statusBarProps?.barStyle ||
          (contextData.colorScheme === 'light'
            ? 'dark-content'
            : 'light-content')
        }
        animated={statusBarProps?.animated ?? true}
      />
      {children}
    </ColorSchemeContext.Provider>
  );
}
