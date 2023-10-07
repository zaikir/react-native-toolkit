import {
  BlurView as BlurViewBase,
  BlurViewProps as BlurViewPropsBase,
} from '@kirz/react-native-blur';
import React, { useEffect, useState } from 'react';

export type BlurViewProps = BlurViewPropsBase & {
  animated?: boolean;
  animationTimeout?: number;
};

export function BlurView({
  animated,
  animationTimeout = 10,
  blurAmount = 10,
  ...props
}: BlurViewProps) {
  const [animatedBlurAmount, setAnimatedBlurAmount] = useState(0);

  useEffect(() => {
    if (!animated) {
      return;
    }

    const interval = setInterval(() => {
      setAnimatedBlurAmount((x) => {
        if (x + 1 > blurAmount) {
          clearInterval(interval);
          return x;
        }

        return x + 1;
      });
    }, animationTimeout);

    return () => {
      clearInterval(interval);
    };
  }, [animated]);

  return (
    <BlurViewBase
      blurAmount={animated ? animatedBlurAmount : blurAmount}
      {...props}
    />
  );
}
