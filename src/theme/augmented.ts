import type { ThemeColor } from './index';

export type Theme = {
  typography: TextVariants;
  fonts: FontFamilies;
  colors: Colors;
  gradients: Gradients;
  values: Values;
};

export interface TextVariants {}
export interface FontFamilies {}
export interface Colors {
  text: ThemeColor;
  background: ThemeColor;
}
export interface Gradients {}
export interface Values {}

export type TextVariant = keyof TextVariants;
export type FontFamily = keyof FontFamilies;
export type Color = keyof Colors;
export type Gradient = keyof Gradients;
export type Value = keyof Values;
