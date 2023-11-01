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
import { Color } from 'theme';

export type ColorScheme = 'light' | 'dark';

export type SkeletonContextType = {
  style: any;
};

export const SkeletonContext = createContext<SkeletonContextType>({} as any);

export type SkeletonProviderProps = PropsWithChildren<{
  interval?: number;
  colorTransform?: number;
  color?: Color;
}>;

export function SkeletonProvider({
  children,
  interval = 800,
  colorTransform = 0.3,
  color = 'skeleton' as any,
}: SkeletonProviderProps) {
  const theme = useTheme();
  const skeletonValue = useSharedValue(0);

  // @ts-ignore
  const color1 = theme?.colors?.[color] ?? 'rgba(223,223,223,1)';
  const colorObj = theme.parseColor(color1, 'rgb');
  const color2 = (
    colorTransform < 0
      ? colorObj.darken(colorTransform)
      : colorObj.lighten(colorTransform)
  )
    .rgb()
    .string();

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
