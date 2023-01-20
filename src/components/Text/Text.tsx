import React, { useMemo } from 'react';
import { StyleProp, Text as TextBase } from 'react-native';
import type { TextStyle } from 'react-native';
import { useTheme } from 'index';
import { getFontWeightName } from './utils/getFontWeightName';

type TextProps = TextStyle & {
  variant?: 'default',
  style?: StyleProp<TextStyle>
};

export default function Text(props: TextProps) {
  const theme = useTheme();

  const fontAssetName = useMemo(() => {
    // @ts-ignore
    const weights = theme.fonts[props.fontFamily];
    const names = getFontWeightName(props.fontWeight);

    const name = weights.find((x: string) => names.includes(x.toLowerCase()));
    if (!name) {
      throw new Error(`Unknown font weight "${name}" for font family "${props.fontFamily}"`);
    }

    return `${props.fontFamily}-${name}`;
  }, [theme, props.fontWeight, props.fontFamily]);

  const style = props.style && 'length' in props.style
    ? [...props.style, { fontFamily: fontAssetName }]
    : { ...props.style && props.style as any, fontFamily: fontAssetName };

  return (
    <TextBase
      {...props}
      style={style}
    />
  );
}
