import React, { useContext } from 'react';
import { ViewProps } from 'react-native';
import Animated from 'react-native-reanimated';

import { SkeletonContext } from 'contexts/SkeletonContext';

export type ViewSkeletonProps = object & ViewProps;

export function ViewSkeleton({ ...props }: ViewSkeletonProps) {
  const { style } = useContext(SkeletonContext);

  return <Animated.View {...props} style={[props.style, style]} />;
}
