export type Theme = {
  mode?: 'dark' | 'light',
  typography: TextVariants,
  fonts: FontFamilies,
  colors: Colors
};

export interface TextVariants {}
export interface FontFamilies {}
export interface Colors {}

export type TextVariant = keyof TextVariants;
export type FontFamily = keyof FontFamilies;
export type Color = keyof Colors;
