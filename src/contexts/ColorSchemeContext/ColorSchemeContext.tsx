import React, {
  createContext, PropsWithChildren, useMemo,
} from 'react';
import { StatusBar, useColorScheme, StatusBarProps } from 'react-native';

export type ColorScheme = 'light' | 'dark';

export type ColorSchemeContextType = {
  colorScheme: ColorScheme
};

export const ColorSchemeContext = createContext<ColorSchemeContextType>({} as any);

export function ColorSchemeProvider({
  children,
  statusBarProps,
}: PropsWithChildren<{ statusBarProps?: StatusBarProps }>) {
  const systemColorScheme = useColorScheme();

  const contextData = useMemo<ColorSchemeContextType>(
    () => ({ colorScheme: systemColorScheme || 'light' }),
    [systemColorScheme],
  );

  return (
    <ColorSchemeContext.Provider value={contextData}>
      <StatusBar
        {...statusBarProps}
        barStyle={statusBarProps?.barStyle || (contextData.colorScheme === 'light' ? 'dark-content' : 'light-content')}
        animated={statusBarProps?.animated ?? true}
      />
      {children}
    </ColorSchemeContext.Provider>
  );
}
