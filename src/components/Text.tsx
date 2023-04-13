import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, Text as TextBase } from 'react-native';
import type { TextProps as TextPropsBase, TextStyle } from 'react-native';

import { useTheme } from 'index';
import type { FontFamily, TextVariant } from 'theme/augmented';
import { getFontWeightName } from 'utils/getFontWeightName';

export type TextProps = TextPropsBase & {
  variant?: 'default' | TextVariant;
  style?: StyleProp<TextStyle> & {
    fontFamily?: FontFamily;
  };
};

export function Text(props: TextProps) {
  const theme = useTheme();

  const flattenStyles = StyleSheet.flatten(props.style) || {};
  const { fontFamily, fontWeight } = flattenStyles;

  // @ts-ignore
  const variant = theme.typography[props.variant ?? 'default'] as TextStyle;

  const fontAssetName = useMemo(() => {
    const font = fontFamily ?? variant?.fontFamily;
    if (!font) {
      return null;
    }

    // @ts-ignore
    const weights = theme.fonts[font] as string[];

    const names =
      (fontWeight ?? variant?.fontWeight) &&
      getFontWeightName(fontWeight ?? variant?.fontWeight);
    const name = names
      ? weights.find((x: string) => names.includes(x.toLowerCase()))
      : weights[0];
    if (!name) {
      throw new Error(
        `Unknown font weight "${fontWeight}" for font family "${font}"`,
      );
    }

    return `${font}-${name}`;
  }, [fontFamily, fontWeight, theme.fonts, variant]);

  return (
    <TextBase
      {...props}
      allowFontScaling={props.allowFontScaling ?? false}
      style={{
        color: theme.colors.text,
        ...variant,
        ...flattenStyles,
        ...(fontAssetName && { fontFamily: fontAssetName }),
      }}
    />
  );
}
