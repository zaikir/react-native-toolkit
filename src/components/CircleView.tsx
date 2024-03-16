import React from 'react';

import { View, ViewProps } from './View';

export type CircleViewProps = ViewProps & {
  radius: number;
  color?: string;
};

export function CircleView({ radius, color, ...props }: CircleViewProps) {
  return (
    <View
      {...props}
      style={[
        {
          width: radius,
          height: radius,
          borderRadius: 100,
          backgroundColor: color,
        },
        props.style,
      ]}
    />
  );
}
