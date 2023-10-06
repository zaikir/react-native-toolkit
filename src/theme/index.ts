import { FunctionComponent, ReactNode } from 'react';

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

export type AlertComponentProps = {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
};

export type ThemeAlertConfig =
  | {
      title: string;
      message: string;
      cancelable?: boolean;
      buttons: {
        text: string;
        style?: 'default' | 'cancel' | 'destructive';
        onPress?: (
          resolve: AlertComponentProps['resolve'],
          reject: AlertComponentProps['reject'],
        ) => void;
      }[];
      onDismiss?: (
        resolve: AlertComponentProps['resolve'],
        reject: AlertComponentProps['reject'],
      ) => void;
    }
  | { component: FunctionComponent<AlertComponentProps> };
