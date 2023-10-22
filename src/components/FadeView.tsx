import MaskedView from '@react-native-masked-view/masked-view';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';

import { scaleY } from 'index';

import { View, ViewProps } from './View';

export type FadeViewProps = ViewProps & {
  topFade?: boolean;
  bottomFade?: boolean;
  leftFade?: boolean;
  rightFade?: boolean;
  fadeDistance?: number;
};

export function FadeView({
  style,
  topFade,
  bottomFade,
  fadeDistance,
  ...props
}: FadeViewProps) {
  return (
    <MaskedView
      {...props}
      style={style}
      maskElement={
        <View style={style}>
          {(topFade ?? true) && (
            <LinearGradient
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              colors={['rgba(0,0,0,0.0)', 'rgba(0,0,0,1)']}
              style={{ height: fadeDistance ?? scaleY(5) }}
              locations={[0, 1]}
            />
          )}
          <View style={{ flex: 1, backgroundColor: 'white' }} />
          {(bottomFade ?? true) && (
            <LinearGradient
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              colors={['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.0)', 'rgba(0,0,0,1)']}
              style={{ height: fadeDistance ?? scaleY(5) }}
              locations={[1, 0.3, 0]}
            />
          )}
        </View>
      }
    />
  );
}
