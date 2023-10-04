import type { TextStyle } from 'react-native';

import type { ThemeColor } from './index';

export function createTheme<
  TextVariant extends string,
  Font extends string,
  Color extends string,
  TextFont extends Font,
  Value extends string,
>(props: {
  typography: Record<
    TextVariant,
    Omit<TextStyle, 'fontFamily' | 'color'> & {
      fontFamily?: TextFont;
      color?: ThemeColor;
    }
  > & {
    default: Omit<TextStyle, 'fontFamily' | 'color'> & {
      fontFamily?: TextFont;
      color?: ThemeColor;
    };
  };
  fonts: Record<Font, string[]>;
  colors: {
    text: ThemeColor;
    background: ThemeColor;
  } & Record<Color, ThemeColor>;
  values: Record<Value, number>;
}) {
  return props;
}
