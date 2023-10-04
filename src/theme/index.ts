export * from './augmented';
export { createTheme } from './createTheme';

export type ThemeColor = { dark: string; light: string } | string;

export type ThemeGradientValue = {
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  colors: string[];
  locations?: number[];
};
export type ThemeGradient =
  | { dark: ThemeGradientValue; light: ThemeGradientValue }
  | ThemeGradientValue;
