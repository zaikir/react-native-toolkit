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

        const { direction, ...props } = gradient;

        return (
          <LinearGradient
            key={gradientIdx}
            {...props}
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
            {...(direction === 'left-right'
              ? {
                  start: { x: 0, y: 0.5 },
                  end: { x: 1, y: 0.5 },
                }
              : direction === 'right-left'
              ? {
                  start: { x: 1, y: 0.5 },
                  end: { x: 0, y: 0.5 },
                }
              : direction === 'up-bottom'
              ? {
                  start: { x: 0.5, y: 0 },
                  end: { x: 0.5, y: 1 },
                }
              : direction === 'bottom-up'
              ? {
                  start: { x: 0.5, y: 1 },
                  end: { x: 0.5, y: 0 },
                }
              : {
                  start: props.start ?? { x: 0, y: 0.5 },
                  end: props.end ?? { x: 1, y: 0.5 },
                })}
          />
        );
      })}
    </>
  );
};
