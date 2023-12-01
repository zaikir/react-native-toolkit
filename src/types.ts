import { FunctionComponent } from 'react';
import { LinearGradientProps } from 'react-native-linear-gradient';

import { RadialGradientProps } from './components/RadialGradient';

export type GradientProps =
  | FunctionComponent
  | ({
      type?: 'linear';
      direction?: 'up-bottom' | 'bottom-up' | 'left-right' | 'right-left';
    } & Pick<
      LinearGradientProps,
      'style' | 'start' | 'end' | 'locations' | 'colors'
    >)
  | ({
      type: 'radial';
    } & Omit<RadialGradientProps, 'svgProps' | 'style'>);

export type InsetShadowProps = {
  offsetX?: number;
  offsetY?: number;
  color?: string;
  blurRadius?: number;
};
