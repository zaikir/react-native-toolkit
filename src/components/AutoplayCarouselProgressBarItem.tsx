import React from 'react';
import { View, ViewProps } from 'react-native';
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { scaleX } from 'index';

export type AutoplayCarouselProgressBarItemProps = {
  index: number;
  progress: SharedValue<number>;
  activeColor: string;
  inactiveColor: string;
  spacing?: number;
} & ViewProps;

export function AutoplayCarouselProgressBarItem({
  index,
  progress,
  activeColor,
  inactiveColor,
  spacing = scaleX(5),
  ...props
}: AutoplayCarouselProgressBarItemProps) {
  const progressStyle = useAnimatedStyle(
    () => ({
      width: `${interpolate(
        progress.value,
        [index, index + 1],
        [0, 100],
        Extrapolation.CLAMP,
      )}%`,
    }),
    [index],
  );

  return (
    <View
      {...props}
      style={[
        {
          borderRadius: scaleX(15),
          backgroundColor: inactiveColor,
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
        },
        props.style,
      ]}
    >
      <Animated.View
        style={[
          {
            backgroundColor: activeColor,
            height: '100%',
          },
          progressStyle,
        ]}
      />
    </View>
  );
}
