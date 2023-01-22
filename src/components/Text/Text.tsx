import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, Text as TextBase } from 'react-native';
import type { TextProps as TextPropsBase, TextStyle } from 'react-native';
import { useTheme } from 'index';
import type { FontFamily } from 'theme/augmented';
import { getFontWeightName } from './utils/getFontWeightName';

type TextProps = TextPropsBase & {
  variant?: 'default',
  style?: StyleProp<TextStyle> & {
    fontFamily?: FontFamily
  }
};

export default function Text(props: TextProps) {
  const theme = useTheme();

  const flattenStyles = StyleSheet.flatten(props.style) || {};
  const { fontFamily, fontWeight } = flattenStyles;

  const fontAssetName = useMemo(() => {
    if (!fontFamily) {
      return null;
    }

    // @ts-ignore
    const weights = theme.fonts[fontFamily] as string[];

    const names = fontWeight && getFontWeightName(fontWeight);
    const name = names
      ? weights.find((x: string) => names.includes(x.toLowerCase()))
      : weights[0];
    if (!name) {
      throw new Error(`Unknown font weight "${fontWeight}" for font family "${fontFamily}"`);
    }

    return `${fontFamily}-${name}`;
  }, [fontFamily, fontWeight, theme.fonts]);

  return (
    <TextBase
      {...props}
      style={{
        color: theme.colors.text,
        ...flattenStyles,
        ...fontAssetName && { fontFamily: fontAssetName },
      }}
    />
  );
}
