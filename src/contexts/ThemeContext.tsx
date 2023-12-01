import Color from 'color';
import fontColorContrast from 'font-color-contrast';
import React, {
  createContext,
  PropsWithChildren,
  useEffect,
  useMemo,
} from 'react';
import type { TextStyle } from 'react-native';
import {
  cancelAnimation,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useColorScheme } from '../hooks/useColorScheme';
import { ViewStyle } from '../index';
import type {
  Theme,
  ThemeAlertConfig,
  ThemeColor,
  ThemeGradientValue,
} from '../theme';

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
  parseColor: (obj: ColorData, model?: ColorModel) => Color;
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
  const skeletonValue = useSharedValue(0);

  const computedTheme = useMemo<UseTheme<Theme>>(() => {
    // @ts-ignore
    const colorsDef = theme.colors as Record<string, ThemeColor>;
    const colors = Object.fromEntries(
      Object.entries(colorsDef).map(([name, color]) => {
        if (typeof color === 'object' && typeof color !== 'function') {
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

    const tempTheme = {
      ...theme,
      colors: colors as any,
      typography,
      getContrastColor: (color) =>
        fontColorContrast(color) === '#ffffff' ? 'white' : 'black',
      parseColor: (obj, model) => new Color(obj, model),
    } as UseTheme<Theme>;

    const finalColors = Object.fromEntries(
      Object.entries(colors).map(([name, color]) => {
        if (typeof color === 'function') {
          // @ts-ignore
          return [name, color(tempTheme)];
        }

        return [name, color];
      }),
    );

    return {
      ...tempTheme,
      colors: finalColors as any,
      getContrastColor: (color) =>
        fontColorContrast(color) === '#ffffff' ? 'white' : 'black',
      parseColor: (obj, model) => new Color(obj, model),
    };
  }, [theme, colorScheme]);

  const skeletonDef = useMemo(() => {
    return {
      color: computedTheme.colors.skeleton,
      // @ts-ignore
      interval: computedTheme.values.skeletonAnimationInterval ?? 800,
      // @ts-ignore
      transform: computedTheme.values.skeletonColorTransform ?? 0.3,
    };
  }, [computedTheme]);

  const skeletonColors = useMemo(() => {
    const skeletonColorTransform = skeletonDef.transform;
    const color1 = skeletonDef.color;
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
  }, [computedTheme, skeletonDef]);

  const skeletonStyle = useAnimatedStyle(
    () => ({
      backgroundColor: interpolateColor(
        skeletonValue.value,
        [0, 1],
        [
          skeletonColors?.color1 ?? 'rgba(255,255,255,0.3)',
          skeletonColors?.color2 ?? 'rgba(255,255,255,0.3)',
        ],
      ),
    }),
    [skeletonColors],
  );

  const contextData = useMemo<ThemeContextType>(() => {
    return {
      theme: computedTheme,
      skeletonStyle,
    };
  }, [computedTheme, skeletonStyle]);

  useEffect(() => {
    skeletonValue.value = withRepeat(
      withTiming(1, { duration: skeletonDef.interval }),
      -1,
      true,
    );

    return () => {
      cancelAnimation(skeletonValue);
    };
  }, [skeletonDef.interval]);

  return (
    <ThemeContext.Provider value={contextData}>
      {children}
    </ThemeContext.Provider>
  );
}
