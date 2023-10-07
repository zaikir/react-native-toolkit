import { FunctionComponent } from 'react';
import { ModalProps } from 'react-native-modal';

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
  options: any;
};

export type ThemeAlertConfig =
  | {
      type?: 'alert';
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
  | {
      type?: 'modal';
      modalProps?: Partial<ModalProps>;
      component: FunctionComponent<AlertComponentProps>;
      componentProps?: Record<string, any>;
    };
