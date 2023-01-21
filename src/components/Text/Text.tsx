import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, Text as TextBase } from 'react-native';
import type { TextProps as TextPropsBase, TextStyle } from 'react-native';
import { useTheme } from 'index';
import type { FontFamily } from 'theme/augmented';
import { getFontWeightName } from './utils/getFontWeightName';

type TextProps = Omit<TextPropsBase, 'style'> & {
  variant?: 'default',
  style?: Omit<StyleProp<TextStyle>, 'fontFamily'> & {
    fontFamily?: FontFamily
  }
};

export default function Text(props: TextProps) {
  const theme = useTheme();

  const flattenStyles = StyleSheet.flatten(props.style);
  const { fontFamily } = flattenStyles;

  const fontAssetName = useMemo(() => {
    if (!fontFamily) {
      return null;
    }

    // @ts-ignore
    const weights = theme.fonts[fontFamily] as string[];
    const names = getFontWeightName(fontFamily);

    const name = weights.find((x: string) => names.includes(x.toLowerCase()));
    if (!name) {
      throw new Error(`Unknown font weight "${name}" for font family "${fontFamily}"`);
    }

    return `${fontFamily}-${name}`;
  }, [fontFamily, theme.fonts]);

  return (
    <TextBase
      {...props}
      style={[
        flattenStyles,
        ...fontAssetName ? [{ fontFamily: fontAssetName }] : [],
      ]}
    />
  );
}
