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

export type ThemeAlertConfig = {
  title: string;
  text?: string;
  cancelable?: boolean;
  buttons: {
    text: string;
    style?: 'default' | 'cancel' | 'destructive';
    onPress?: (resolve: any, reject: any) => void;
  }[];
};
