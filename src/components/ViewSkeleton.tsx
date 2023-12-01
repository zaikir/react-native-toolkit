import React, { useContext } from 'react';
import { ViewProps } from 'react-native';
import Animated from 'react-native-reanimated';

import { ThemeContext } from '../contexts/ThemeContext';

export type ViewSkeletonProps = ViewProps;

export function ViewSkeleton({ ...props }: ViewSkeletonProps) {
  const { skeletonStyle } = useContext(ThemeContext);

  return <Animated.View {...props} style={[props.style, skeletonStyle]} />;
}
