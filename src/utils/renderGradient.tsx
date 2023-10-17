import React from 'react';
import LinearGradient from 'react-native-linear-gradient';

import { RadialGradient } from 'components/RadialGradient';
import { GradientProps } from 'types';

export const renderGradient = (gradients: GradientProps[]) => {
  return (
    <>
      {gradients.map((gradient, gradientIdx) => {
        if (typeof gradient === 'function') {
          const Component = gradient;
          return <Component key={gradientIdx} />;
        }

        if ('type' in gradient && gradient.type === 'radial') {
          return (
            <RadialGradient
              key={gradientIdx}
              {...gradient}
              style={{ position: 'absolute', left: 0, top: 0 }}
            />
          );
        }

        return (
          <LinearGradient
            key={gradientIdx}
            {...gradient}
            start={gradient.start ?? { x: 0, y: 0 }}
            end={gradient.end ?? { x: 1, y: 1 }}
            style={[
              {
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
              },
              gradient.style,
            ]}
          />
        );
      })}
    </>
  );
};
