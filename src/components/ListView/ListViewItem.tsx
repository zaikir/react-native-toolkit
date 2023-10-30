import React, { ReactNode, memo } from 'react';
import { View } from 'react-native';

export type ListViewItemProps = {
  item?: any;
  itemIndex?: number;
  section: any;
  sectionIndex: number;
  itemSize?: number;
  numColumns: number;
  spacing: number;
  renderContent?: (context: any) => ReactNode;
};

export const ListViewItem = memo(
  ({
    numColumns,
    itemSize,
    spacing,
    section,
    sectionIndex,
    item,
    itemIndex,
    renderContent,
  }: ListViewItemProps) => (
    <View style={{ flex: 1 / numColumns, height: itemSize }}>
      <View style={{ flex: 1, paddingLeft: spacing }}>
        {renderContent?.({
          section,
          sectionIndex,
          ...(item && { item, itemIndex }),
        })}
      </View>
    </View>
  ),
);
