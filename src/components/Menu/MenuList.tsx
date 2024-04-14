import React, { ReactNode } from 'react';
import { TouchableOpacityProps, View } from 'react-native';

import { Menu, MenuProps } from './Menu';
import { MenuListItem } from './MenuListItem';
import { TextProps } from '../Text';

export type MenuListProps<
  T extends { text: string; onPress: () => void } = {
    text: string;
    onPress: () => void;
  },
> = Omit<MenuProps, 'children'> & {
  items: T[];
  itemStyle?: TouchableOpacityProps['style'];
  itemTextStyle?: TextProps['style'];
  renderItem?: (item: T, index: number) => ReactNode;
  renderSeparator?: (item: T, index: number) => ReactNode;
  keyExtractor?: (item: T, index: number) => React.Key;
};

export function MenuList<
  T extends { text: string; onPress: () => void } = {
    text: string;
    onPress: () => void;
  },
>({
  items,
  itemStyle,
  itemTextStyle,
  renderItem,
  renderSeparator,
  keyExtractor,
  ...props
}: MenuListProps<T>) {
  return (
    <Menu {...props}>
      {items.map((item, itemIdx) => (
        <View key={keyExtractor?.(item, itemIdx) ?? itemIdx}>
          <>
            {!renderItem ? (
              <MenuListItem
                item={item}
                style={[
                  {
                    flexDirection:
                      props.position?.horizontal === 'left'
                        ? 'row-reverse'
                        : 'row',
                  },
                  itemStyle,
                ]}
                textStyle={itemTextStyle}
              />
            ) : (
              renderItem(item, itemIdx)
            )}
            {itemIdx < items.length - 1 && renderSeparator?.(item, itemIdx)}
          </>
        </View>
      ))}
    </Menu>
  );
}
