import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

import { useMenu } from 'hooks/useMenu';

import { scaleX, scaleY } from '../../utils/scale';
import { Text, TextProps } from '../Text';

export type MenuListItemProps<T extends { text: string }> =
  TouchableOpacityProps & {
    item: T;
    textStyle?: TextProps['style'];
  };

export function MenuListItem<T extends { text: string }>({
  item,
  textStyle,
  ...props
}: MenuListItemProps<T>) {
  const { closeMenu } = useMenu();

  return (
    <TouchableOpacity
      {...props}
      onPress={(e) => {
        closeMenu();

        props?.onPress?.(e);
      }}
      style={[
        {
          flexDirection: 'row',
          paddingVertical: scaleY(10),
          paddingHorizontal: scaleX(20),
          alignItems: 'center',
        },
        props.style,
      ]}
    >
      <Text style={textStyle}>{item.text}</Text>
    </TouchableOpacity>
  );
}
