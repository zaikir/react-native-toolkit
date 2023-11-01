import React, { useContext, useEffect } from 'react';
import { ViewProps } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { SkeletonContext } from 'contexts/SkeletonContext';
import { useTheme } from 'index';

export type ViewSkeletonProps = object & ViewProps;

export function ViewSkeleton({ ...props }: ViewSkeletonProps) {
  const theme = useTheme();
  const { skeletonValue, colorTransform, color } = useContext(SkeletonContext);

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

  useEffect(() => {
    skeletonValue.value = withRepeat(
      withTiming(1, { duration: 200 }),
      -1,
      false,
    );
  }, []);

  return (
    <Animated.View
      {...props}
      style={[props.style, { backgroundColor: 'red' }, style]}
    />
  );
}
