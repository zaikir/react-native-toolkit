import { FunctionComponent } from 'react';
import { LinearGradientProps } from 'react-native-linear-gradient';

export type GradientProps =
  | FunctionComponent
  | Pick<
      LinearGradientProps,
      'style' | 'start' | 'end' | 'locations' | 'colors'
    >;
