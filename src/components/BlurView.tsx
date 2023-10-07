import {
  BlurView as BlurViewBase,
  BlurViewProps as BlurViewPropsBase,
} from '@kirz/react-native-blur';
import React, { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';

export type BlurViewProps = BlurViewPropsBase & {
  animated?: boolean;
  enteringAnimationDuration?: number;
};

export function BlurView({
  animated,
  enteringAnimationDuration = 200,
  blurAmount = 10,
  ...props
}: BlurViewProps) {
  const enteringAnimation = useRef(new Animated.Value(0)).current;
  const [animatedBlurAmount, setAnimatedBlurAmount] = useState(0);

  useEffect(() => {
    if (!animated) {
      return;
    }

    const animation = Animated.timing(enteringAnimation, {
      toValue: blurAmount,
      duration: enteringAnimationDuration,
      useNativeDriver: false,
    });

    animation.start();
    const listener = enteringAnimation.addListener(({ value }) => {
      setAnimatedBlurAmount(value);
    });

    return () => {
      animation.stop();
      enteringAnimation.removeListener(listener);
    };
  }, [animated]);

  return (
    <BlurViewBase
      blurAmount={animated ? animatedBlurAmount : blurAmount}
      {...props}
    />
  );
}
