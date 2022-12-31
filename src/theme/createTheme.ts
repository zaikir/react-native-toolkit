import type { TextStyle } from 'react-native';
import type { ThemeColor } from './index';

export function createTheme<
  TextVariant extends string,
  Font extends string,
  Color extends string,
>(props: {
  typography: Record<TextVariant, TextStyle>,
  fonts: Record<Font, { weights: TextStyle['fontWeight'][] }>,
  colors: Record<Color, ThemeColor>,
}) {
  return props;
}
