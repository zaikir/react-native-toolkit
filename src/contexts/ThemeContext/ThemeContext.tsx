import fontColorContrast from 'font-color-contrast';
import React, { createContext, PropsWithChildren, useMemo } from 'react';
import type { TextStyle } from 'react-native';

import { useColorScheme } from 'hooks/useColorScheme';
import type {
  Theme,
  ThemeAlertConfig,
  ThemeColor,
  ThemeGradientValue,
} from 'theme';

export type UseTheme<T extends Theme> = {
  typography: Record<keyof T['typography'], TextStyle>;
  fonts: T['fonts'];
  colors: Record<keyof T['colors'], string>;
  gradients: Record<keyof T['gradients'], ThemeGradientValue>;
  values: Record<keyof T['values'], number>;
  alerts: Record<keyof T['alerts'], ThemeAlertConfig>;
  getContrastColor: (color: string) => 'black' | 'white';
};

export type ThemeContextType = {
  theme: UseTheme<Theme>;
};

export const ThemeContext = createContext<ThemeContextType>({} as any);

export function ThemeProvider({
  children,
  theme,
}: PropsWithChildren<{ theme: Theme }>) {
  const { colorScheme } = useColorScheme();
  const contextData = useMemo<ThemeContextType>(() => {
    // @ts-ignore
    const colorsDef = theme.colors as Record<string, ThemeColor>;
    const colors = Object.fromEntries(
      Object.entries(colorsDef).map(([name, color]) => {
        if (typeof color === 'object') {
          return [name, color[colorScheme]];
        }

        return [name, color];
      }),
    );

    const typographyDef = theme.typography as Record<string, TextStyle>;
    const typography = Object.fromEntries(
      Object.entries(typographyDef).map(([name, textStyle]) => {
        if (textStyle.color && typeof textStyle.color === 'object') {
          return [name, { ...textStyle, color: textStyle.color[colorScheme] }];
        }

        return [name, textStyle];
      }),
    ) as any;

    return {
      theme: {
        ...theme,
        colors: colors as any,
        typography,
        getContrastColor: (color) =>
          fontColorContrast(color) === '#ffffff' ? 'white' : 'black',
      },
    };
  }, [theme, colorScheme]);

  return (
    <ThemeContext.Provider value={contextData}>
      {children}
    </ThemeContext.Provider>
  );
}
