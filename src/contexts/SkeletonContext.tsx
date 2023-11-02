import React, {
  createContext,
  PropsWithChildren,
  useEffect,
  useMemo,
} from 'react';
import {
  cancelAnimation,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from 'index';
import { Theme } from 'theme';

export type ColorScheme = 'light' | 'dark';

export type SkeletonContextType = {
  style: any;
};

export const SkeletonContext = createContext<SkeletonContextType>({} as any);

export type SkeletonProviderProps = PropsWithChildren<{
  interval?: number;
  colorTransform?: number;
  color?: string | ((theme: Theme) => string);
}>;

export function SkeletonProvider({
  children,
  interval = 800,
  colorTransform = 0.3,
  color,
}: SkeletonProviderProps) {
  const theme = useTheme();
  const skeletonValue = useSharedValue(0);

  const color1 =
    typeof color === 'function' ? color(theme) : 'rgba(223,223,223,1)';
  const colorObj =
    colorTransform < 0
      ? theme.parseColor(color1, 'rgb').darken(colorTransform)
      : theme.parseColor(color1, 'rgb').lighten(colorTransform);
  const color2 = `rgba(${colorObj.red()},${colorObj.green()},${colorObj.blue()},${colorObj.alpha()})`;

  const style = useAnimatedStyle(
    () => ({
      backgroundColor: interpolateColor(
        skeletonValue.value,
        [0, 1],
        [color1, color2],
      ),
    }),
    [],
  );

  const contextData = useMemo<SkeletonContextType>(
    () => ({
      style,
    }),
    [],
  );

  useEffect(() => {
    skeletonValue.value = withRepeat(
      withTiming(1, { duration: interval }),
      -1,
      true,
    );

    return () => {
      cancelAnimation(skeletonValue);
    };
  }, [interval]);

  return (
    <SkeletonContext.Provider value={contextData}>
      {children}
    </SkeletonContext.Provider>
  );
}
