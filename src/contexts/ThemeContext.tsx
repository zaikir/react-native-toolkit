import Color from 'color';
import fontColorContrast from 'font-color-contrast';
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
} from 'react';
import type { TextStyle } from 'react-native';
import { interpolateColor, useAnimatedStyle } from 'react-native-reanimated';

import { useColorScheme } from 'hooks/useColorScheme';
import { ViewStyle } from 'index';
import type {
  Theme,
  ThemeAlertConfig,
  ThemeColor,
  ThemeGradientValue,
} from 'theme';

import { SkeletonContext } from './SkeletonContext';

type ColorData = ConstructorParameters<typeof Color>[0];
type ColorModel = ConstructorParameters<typeof Color>[1];

export type UseTheme<T extends Theme> = {
  typography: Record<keyof T['typography'], TextStyle>;
  fonts: T['fonts'];
  colors: Record<keyof T['colors'], string>;
  gradients: Record<keyof T['gradients'], ThemeGradientValue>;
  values: Record<keyof T['values'], number>;
  alerts: Record<keyof T['alerts'], ThemeAlertConfig>;
  getContrastColor: (color: string) => 'black' | 'white';
  parseColor: (obj: ColorData, model: ColorModel) => Color;
};

export type ThemeContextType = {
  theme: UseTheme<Theme>;
  skeletonStyle: ViewStyle | null;
};

export const ThemeContext = createContext<ThemeContextType>({} as any);

export function ThemeProvider({
  children,
  theme,
}: PropsWithChildren<{ theme: Theme }>) {
  const { colorScheme } = useColorScheme();
  const skeletonContext = useContext(SkeletonContext);

  const computedTheme = useMemo<UseTheme<Theme>>(() => {
    // @ts-ignore
    const colorsDef = theme.colors as Record<string, ThemeColor>;
    const colors = Object.fromEntries(
      Object.entries(colorsDef).map(([name, color]) => {
        if (typeof color === 'object') {
          // @ts-ignore
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
      ...theme,
      colors: colors as any,
      typography,
      getContrastColor: (color) =>
        fontColorContrast(color) === '#ffffff' ? 'white' : 'black',
      parseColor: (obj, model) => new Color(obj, model),
    };
  }, [theme, colorScheme]);

  const skeletonColors = useMemo(() => {
    if (!skeletonContext) {
      return null;
    }

    const skeletonColorTransform = skeletonContext.colorTransform ?? 0.3;
    const color1 =
      typeof skeletonContext.color === 'function'
        ? skeletonContext.color(computedTheme)
        : 'rgba(223,223,223,1)';
    const colorObj =
      skeletonColorTransform < 0
        ? computedTheme
            .parseColor(color1, 'rgb')
            .darken(Math.abs(skeletonColorTransform))
        : computedTheme
            .parseColor(color1, 'rgb')
            .lighten(skeletonColorTransform);
    const color2 = `rgba(${colorObj.red()},${colorObj.green()},${colorObj.blue()},${colorObj.alpha()})`;

    return { color1, color2 };
  }, [skeletonContext, computedTheme]);

  const skeletonStyle = useAnimatedStyle(
    () => ({
      backgroundColor: interpolateColor(
        skeletonContext ? skeletonContext.skeletonValue.value : 0,
        [0, 1],
        [
          skeletonColors?.color1 ?? 'rgba(255,255,255,0.3)',
          skeletonColors?.color2 ?? 'rgba(255,255,255,0.3)',
        ],
      ),
    }),
    [skeletonColors, skeletonContext],
  );

  const contextData = useMemo<ThemeContextType>(() => {
    return {
      theme: computedTheme,
      skeletonStyle,
    };
  }, [computedTheme, skeletonStyle]);

  return (
    <ThemeContext.Provider value={contextData}>
      {children}
    </ThemeContext.Provider>
  );
}
