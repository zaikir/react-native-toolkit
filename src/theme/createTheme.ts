import type { TextStyle } from 'react-native';
import type { ThemeColor } from './index';

type FontWeight =
  '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' |
  '100i' | '200i' | '300i' | '400i' | '500i' | '600i' | '700i' | '800i' | '900i';

export function createTheme<
  TextVariant extends string,
  Font extends string,
  Color extends string,
>(props: {
  typography: Record<TextVariant, TextStyle>,
  fonts: Record<Font, FontWeight[]>,
  colors: Record<Color, ThemeColor>,
}) {
  return props;
}
