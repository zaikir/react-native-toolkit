import { FunctionComponent } from 'react';
import { ModalProps } from 'react-native-modal';

import { Theme } from './augmented';
import { BlurViewProps } from '../components/BlurView';
import { UseTheme } from '../contexts/ThemeContext';
export * from './augmented';
export { createTheme } from './createTheme';

export type ThemeColor =
  | string
  | { dark: string; light: string }
  | ((
      theme: Omit<
        UseTheme<Theme>,
        'colors' & { colors: Record<string, string> }
      >,
    ) => string);

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

type ThemeAlertConfigData =
  | {
      type?: 'alert' | 'action-sheet';
      title?: string;
      message?: string;
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
      modalProps?: Partial<
        ModalProps & {
          blurType?: BlurViewProps['blurType'];
          blurProps?: Partial<Omit<BlurViewProps, 'blurType'>>;
        }
      >;
      component: FunctionComponent<AlertComponentProps>;
      componentProps?: Record<string, any>;
    };

export type ThemeAlertConfig =
  | ThemeAlertConfigData
  | ((props: any) => ThemeAlertConfigData);
