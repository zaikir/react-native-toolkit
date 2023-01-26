import type { ThemeColor } from './index';

export type Theme = {
  typography: TextVariants;
  fonts: FontFamilies;
  colors: Colors;
};

export interface TextVariants
  extends Record<
    string,
    Omit<string, 'fontFamily' | 'color'> & {
      fontFamily?: string;
      color?: ThemeColor;
    }
  > {}
export interface FontFamilies {}
export interface Colors {
  text: ThemeColor;
  background: ThemeColor;
}

export type TextVariant = keyof TextVariants;
export type FontFamily = keyof FontFamilies;
export type Color = keyof Colors;
