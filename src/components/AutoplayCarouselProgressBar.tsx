import React from 'react';

import { scaleX, scaleY } from 'index';

import {
  AutoplayCarouselProgressBarItem,
  AutoplayCarouselProgressBarItemProps,
} from './AutoplayCarouselProgressBarItem';
import { FullscreenCarouselContext } from './FullscreenCarousel';
import { View, ViewProps } from './View';

export type AutoplayCarouselProgressBarProps = {
  activeColor?: string;
  inactiveColor?: string;
  spacing?: number;
  itemProps?: Partial<
    Omit<AutoplayCarouselProgressBarItemProps, keyof FullscreenCarouselContext>
  >;
  style?: ViewProps['style'];
} & FullscreenCarouselContext;

export function AutoplayCarouselProgressBar({
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
          {...props}
          {...itemProps}
          key={x}
          index={x}
          slidesCount={slidesCount}
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
