import React from 'react';
import { SharedValue } from 'react-native-reanimated';

import { scaleX, scaleY } from 'index';

import {
  AutoplayCarouselProgressBarItem,
  AutoplayCarouselProgressBarItemProps,
} from './AutoplayCarouselProgressBarItem';
import { View, ViewProps } from './View';

export type AutoplayCarouselProgressBarProps = {
  progress: SharedValue<number>;
  slidesCount: number;
  activeColor?: string;
  inactiveColor?: string;
  spacing?: number;
  itemProps?: Partial<AutoplayCarouselProgressBarItemProps>;
  style?: ViewProps['style'];
};

export function AutoplayCarouselProgressBar({
  progress,
  slidesCount,
  activeColor = '#63E3B5',
  inactiveColor = 'rgba(217, 217, 217, 0.7)',
  spacing = scaleX(5),
  itemProps,
  ...props
}: AutoplayCarouselProgressBarProps) {
  return (
    <View
      {...props}
      style={[
        {
          height: scaleY(4),
          flexDirection: 'row',
        },
        props.style,
      ]}
    >
      {[...new Array(slidesCount).keys()].map((x) => (
        <AutoplayCarouselProgressBarItem
          {...itemProps}
          key={x}
          index={x}
          progress={progress}
          activeColor={itemProps?.activeColor ?? activeColor}
          inactiveColor={itemProps?.inactiveColor ?? inactiveColor}
          style={[
            {
              marginRight: x < slidesCount - 1 ? spacing : 0,
            },
            itemProps?.style,
          ]}
        />
      ))}
    </View>
  );
}
