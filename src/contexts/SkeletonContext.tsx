import React, {
  createContext,
  PropsWithChildren,
  useEffect,
  useMemo,
} from 'react';
import {
  cancelAnimation,
  SharedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Color } from 'theme';

export type ColorScheme = 'light' | 'dark';

export type SkeletonContextType = {
  skeletonValue: SharedValue<number>;
  color?: Color;
  colorTransform: number;
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
  const skeletonValue = useSharedValue(0);

  const contextData = useMemo<SkeletonContextType>(
    () => ({
      skeletonValue,
      colorTransform,
      color,
    }),
    [colorTransform, color],
  );

  useEffect(() => {
    skeletonValue.value = withRepeat(
      withTiming(1, { duration: interval }),
      -1,
      false,
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
