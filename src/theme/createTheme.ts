import type { TextStyle } from 'react-native';

import type { ThemeAlertConfig, ThemeColor, ThemeGradientValue } from './index';

export function createTheme<
  TextVariant extends string,
  Font extends string,
  Color extends string,
  TextFont extends Font,
  Value extends string,
  Gradient extends string,
  Alert extends string,
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
    skeleton?: ThemeColor | { color: ThemeColor; transform: number };
  } & Record<Color, ThemeColor>;
  gradients: Record<Gradient, ThemeGradientValue>;
  values: {
    skeletonColorTransform?: number;
    skeletonAnimationInterval?: number;
  } & Record<Value, number>;
  alerts: Record<Alert, ThemeAlertConfig>;
}) {
  return props;
}
