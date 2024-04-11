import MaskedView from '@react-native-masked-view/masked-view';
import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, Text as TextBase } from 'react-native';
import type {
  TextProps as TextPropsBase,
  TextStyle as TextStyleBase,
} from 'react-native';

import { View, useTheme } from '../index';
import type { FontFamily, TextVariant } from '../theme/augmented';
import { GradientProps } from '../types';
import { getFontWeightName } from '../utils/getFontWeightName';
import { textStyleKeys } from '../utils/styles';

export type TextStyle = TextStyleBase & {
  fontFamily?: FontFamily;
  gradient?: GradientProps | GradientProps[];
};

export type TextProps = Omit<TextPropsBase, 'style'> & {
  variant?: 'default' | TextVariant;
  style?: StyleProp<TextStyle>;
  fontSize?: TextStyle['fontSize'];
  fontWeight?: TextStyle['fontWeight'];
  fontFamily?: TextStyle['fontFamily'];
  color?: TextStyle['color'];
};

export function Text({
  style,
  fontSize: initialFontSize,
  fontWeight: initialFontWeight,
  fontFamily: initialFontFamily,
  ...props
}: TextProps) {
  const theme = useTheme();

  const {
    textStyle,
    flattenStyle: { gradient: gradientProp, ...flattenStyle },
  } = useMemo(() => {
    return Object.entries(StyleSheet.flatten(style) ?? {}).reduce(
      (acc, x) => {
        if (textStyleKeys.includes(x[0])) {
          return {
            flattenStyle: acc.flattenStyle,
            textStyle: {
              ...acc.textStyle,
              [x[0]]: x[1],
            },
          };
        }

        return {
          flattenStyle: {
            ...acc.flattenStyle,
            [x[0]]: x[1],
          },
          textStyle: acc.textStyle,
        };
      },
      {
        flattenStyle: {},
        textStyle: {},
      } as {
        flattenStyle: TextStyle;
        textStyle: TextStyle;
      },
    );
  }, [style]);

  const gradients = !gradientProp
    ? []
    : typeof gradientProp === 'function'
    ? [gradientProp]
    : 'length' in gradientProp
    ? gradientProp
    : [gradientProp];

  const { fontFamily: styleFontFamily, fontWeight: styleFontWeight } =
    textStyle;

  // @ts-ignore
  const variant = theme.typography[props.variant ?? 'default'] as TextStyle;

  const fontAssetName = useMemo(() => {
    const fontFamily = styleFontFamily ?? initialFontFamily;
    const fontWeight = styleFontWeight ?? initialFontWeight;

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
  }, [
    styleFontWeight,
    styleFontWeight,
    theme.fonts,
    variant,
    initialFontFamily,
    initialFontSize,
    initialFontWeight,
  ]);

  const renderTextNode = (otherProps: TextProps) => {
    return (
      <TextBase
        {...props}
        {...otherProps}
        allowFontScaling={
          otherProps.allowFontScaling ?? props.allowFontScaling ?? false
        }
        style={[
          {
            color: theme.colors.text,
            ...variant,
            fontSize: initialFontSize,
            ...textStyle,
            ...(fontAssetName && { fontFamily: fontAssetName }),
          },
          otherProps.style,
        ]}
      />
    );
  };

  if (!gradients.length) {
    return renderTextNode({
      style: flattenStyle,
    });
  }

  return (
    <MaskedView style={flattenStyle} maskElement={renderTextNode({})}>
      <View style={[{ backgroundGradient: gradients }]}>
        {renderTextNode({
          style: { opacity: 0 },
        })}
      </View>
    </MaskedView>
  );
}
