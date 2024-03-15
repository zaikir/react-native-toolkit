import MaskedView from '@react-native-masked-view/masked-view';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';

import { View, ViewProps } from './View';
import { scaleY, useTheme } from '../index';

type Side = 'left' | 'right' | 'bottom' | 'top';

const DEFAULT_FADE = scaleY(10);

export type FadeViewProps = ViewProps & {
  sides?: Partial<Record<Side, boolean>>;
  fadeDistance?: number | Partial<Record<Side, number>>;
  fadeStart?: number | Partial<Record<Side, number>>;
  fadeEnd?: number | Partial<Record<Side, number>>;
  fadeColor?: string;
};

function InnerFadeView({
  style,
  sides,
  fadeDistance,
  fadeStart,
  fadeEnd,
  direction,
  fadeColor,
  ...props
}: FadeViewProps & { direction: 'vertical' | 'horizontal' }) {
  const theme = useTheme();
  const minFadeColor = fadeColor ?? 'rgba(0,0,0,1)';
  const maxFadeColor = theme.parseColor(minFadeColor).fade(1).hexa();

  if (direction === 'vertical' && !sides?.bottom && !sides?.top) {
    return props.children as JSX.Element;
  }

  if (direction === 'horizontal' && !sides?.left && !sides?.right) {
    return props.children as JSX.Element;
  }

  const maskElement =
    direction === 'vertical' ? (
      <View
        style={[
          style,
          { position: 'absolute', left: 0, right: 0, bottom: 0, top: 0 },
        ]}
      >
        {(sides?.top ?? false) && (
          <LinearGradient
            start={{
              x: 0.5,
              y: (typeof fadeStart === 'number' ? 0 : fadeStart?.top) ?? 0,
            }}
            end={{
              x: 0.5,
              y: (typeof fadeEnd === 'number' ? 0 : fadeEnd?.top) ?? 1,
            }}
            colors={[maxFadeColor, minFadeColor]}
            style={{
              height:
                (typeof fadeDistance === 'number'
                  ? fadeDistance
                  : fadeDistance?.top) ?? DEFAULT_FADE,
            }}
            locations={[0, 1]}
          />
        )}
        <View
          style={{
            flex: 1,
            backgroundColor: 'white',
            marginVertical: -2,
          }}
        />
        {(sides?.bottom ?? true) && (
          <LinearGradient
            start={{
              x: 0.5,
              y: (typeof fadeStart === 'number' ? 0 : fadeStart?.bottom) ?? 0,
            }}
            end={{
              x: 0.5,
              y: (typeof fadeEnd === 'number' ? 0 : fadeEnd?.bottom) ?? 1,
            }}
            colors={[minFadeColor, maxFadeColor]}
            style={{
              height:
                (typeof fadeDistance === 'number'
                  ? fadeDistance
                  : fadeDistance?.bottom) ?? DEFAULT_FADE,
            }}
            locations={[0, 1]}
          />
        )}
      </View>
    ) : (
      <View
        style={[
          style,
          {
            flexDirection: 'row',
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
          },
        ]}
      >
        {(sides?.left ?? false) && (
          <LinearGradient
            start={{
              x: (typeof fadeStart === 'number' ? 0 : fadeStart?.left) ?? 0,
              y: 0.5,
            }}
            end={{
              x: (typeof fadeEnd === 'number' ? 0 : fadeEnd?.left) ?? 1,
              y: 0.5,
            }}
            colors={[maxFadeColor, minFadeColor]}
            style={{
              width:
                (typeof fadeDistance === 'number'
                  ? fadeDistance
                  : fadeDistance?.left) ?? DEFAULT_FADE,
            }}
            locations={[0, 1]}
          />
        )}
        <View
          style={{
            flex: 1,
            backgroundColor: 'white',
            marginHorizontal: -2,
          }}
        />
        {(sides?.right ?? false) && (
          <LinearGradient
            start={{
              x: (typeof fadeStart === 'number' ? 0 : fadeStart?.right) ?? 0,
              y: 0.5,
            }}
            end={{
              x: (typeof fadeEnd === 'number' ? 0 : fadeEnd?.right) ?? 1,
              y: 0.5,
            }}
            colors={[minFadeColor, maxFadeColor]}
            style={{
              width:
                (typeof fadeDistance === 'number'
                  ? fadeDistance
                  : fadeDistance?.right) ?? DEFAULT_FADE,
            }}
            locations={[0, 1]}
          />
        )}
      </View>
    );

  return <MaskedView {...props} style={style} maskElement={maskElement} />;
}

export function FadeView({
  sides = { bottom: true },
  fadeDistance,
  fadeColor,
  ...props
}: FadeViewProps) {
  return (
    <InnerFadeView
      sides={sides}
      fadeDistance={fadeDistance}
      {...props}
      direction="vertical"
      fadeColor={fadeColor}
    >
      <InnerFadeView
        sides={sides}
        fadeDistance={fadeDistance}
        {...props}
        direction="horizontal"
        fadeColor={fadeColor}
      />
    </InnerFadeView>
  );
}
