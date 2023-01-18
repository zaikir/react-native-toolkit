import type { TextStyle } from 'react-native';
import type { ThemeColor } from './index';

export function createTheme<
  TextVariant extends string,
  Font extends string,
  Color extends string,
  TextFont extends Font,
>(props: {
  typography: Record<TextVariant, Omit<TextStyle, 'fontFamily'> & {
    fontFamily?: TextFont
  }>,
  fonts: Record<Font, string[]>,
  colors: Record<Color, ThemeColor>,
}) {
  return props;
}
