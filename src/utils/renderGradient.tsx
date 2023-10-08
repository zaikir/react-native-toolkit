import React from 'react';
import LinearGradient from 'react-native-linear-gradient';

import { GradientProps } from 'types';

export const renderGradient = (gradients: GradientProps[]) => {
  return (
    <>
      {gradients.map((gradient, gradientIdx) => {
        if (typeof gradient === 'function') {
          const Component = gradient;
          return <Component key={gradientIdx} />;
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
                width: '100%',
                height: '100%',
              },
              gradient.style,
            ]}
          />
        );
      })}
    </>
  );
};
