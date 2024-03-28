import React, { useCallback, useRef, useState } from 'react';
import { FlatList, FlatListProps, Platform } from 'react-native';

import { View } from './View';
import { scaleX } from '../utils/scale';

export type SnapCarouselProps<T extends { id: React.Key }> = {
  items: T[];
  renderItem: NonNullable<FlatListProps<T>['renderItem']>;
  spacing?: number;
} & Omit<FlatListProps<T>, 'data' | 'renderItem'>;

export function SnapCarousel<T extends { id: React.Key }>({
  items,
  renderItem: originalRenderItem,
  spacing = scaleX(14),
  ...props
}: SnapCarouselProps<T>) {
  const [snapToOffsets, setSnapToOffsets] = useState<number[]>([]);
  const snapToOffsetsRef = useRef<number[]>([]);

  const handleItemLayout = useCallback(
    (e: any, index: number) => {
      const itemWidth = e.nativeEvent.layout.width;

      snapToOffsetsRef.current[index] = itemWidth;

      if (snapToOffsetsRef.current.filter((x) => !!x).length === items.length) {
        setSnapToOffsets(
          snapToOffsetsRef.current.reduce((acc, x, index) => {
            if (index === 0) {
              return [x + spacing];
            }
            return [...acc, acc[index - 1] + x + spacing];
          }, [] as number[]),
        );
      }
    },
    [spacing, items.length],
  );

  const renderItem = useCallback(
    ({
      index,
      item,
      separators,
    }: Parameters<SnapCarouselProps<T>['renderItem']>[0]) => {
      return (
        <View
          style={{
            marginRight: index !== items.length - 1 ? spacing : 0,
          }}
          {...(snapToOffsets.length !== items.length
            ? {
                onLayout: (e) => handleItemLayout(e, index),
              }
            : {})}
        >
          {originalRenderItem({ index, item, separators })}
        </View>
      );
    },
    [handleItemLayout, originalRenderItem, items.length, snapToOffsets.length],
  );

  return (
    <FlatList
      {...props}
      renderItem={renderItem}
      horizontal
      data={items}
      showsHorizontalScrollIndicator={false}
      snapToOffsets={snapToOffsets}
      snapToAlignment={props.snapToAlignment ?? 'start'}
      decelerationRate={
        props.decelerationRate ?? (Platform.OS === 'ios' ? 0.992 : 0.985)
      }
      keyboardShouldPersistTaps="always"
      keyExtractor={
        props.keyExtractor ?? ((item: any, idx) => (item?.id ?? idx).toString())
      }
    />
  );
}
