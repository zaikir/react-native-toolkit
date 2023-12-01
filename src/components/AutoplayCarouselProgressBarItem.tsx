import React from 'react';
import { View, ViewProps } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { FullscreenCarouselContext } from './FullscreenCarousel';
import { scaleX } from '../index';

export type AutoplayCarouselProgressBarItemProps = {
  index: number;
  activeColor: string;
  inactiveColor: string;
  spacing?: number;
} & ViewProps &
  FullscreenCarouselContext;

export function AutoplayCarouselProgressBarItem({
  index,
  progress,
  activeColor,
  inactiveColor,
  spacing = scaleX(5),
  ...props
}: AutoplayCarouselProgressBarItemProps) {
  const progressStyle = useAnimatedStyle(() => {
    const scrollValue = interpolate(
      progress.value,
      [index, index + 1],
      [0, 100],
      Extrapolation.CLAMP,
    );

    return {
      width: `${scrollValue}%`,
    };
  }, [index]);

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
            position: 'absolute',
            backgroundColor: activeColor,
            height: '100%',
          },
          progressStyle,
        ]}
      />
    </View>
  );
}
