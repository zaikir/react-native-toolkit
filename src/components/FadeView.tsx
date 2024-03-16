import MaskedView from '@react-native-masked-view/masked-view';
import React, { useMemo } from 'react';
import { easeGradient } from 'react-native-easing-gradient';
import LinearGradient from 'react-native-linear-gradient';

import { View, ViewProps } from './View';
import { scaleY } from '../index';

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
  colors,
  locations,
  ...props
}: FadeViewProps & {
  direction: 'vertical' | 'horizontal';
  colors: string[];
  locations: number[];
}) {
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
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
            pointerEvents: 'none',
          },
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
            style={{
              height:
                (typeof fadeDistance === 'number'
                  ? fadeDistance
                  : fadeDistance?.top) ?? DEFAULT_FADE,
            }}
            colors={colors}
            locations={[...locations].reverse()}
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
            style={{
              height:
                (typeof fadeDistance === 'number'
                  ? fadeDistance
                  : fadeDistance?.bottom) ?? DEFAULT_FADE,
            }}
            colors={colors}
            locations={locations}
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
            pointerEvents: 'none',
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
            style={{
              width:
                (typeof fadeDistance === 'number'
                  ? fadeDistance
                  : fadeDistance?.left) ?? DEFAULT_FADE,
            }}
            colors={colors}
            locations={[...locations].reverse()}
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
            style={{
              width:
                (typeof fadeDistance === 'number'
                  ? fadeDistance
                  : fadeDistance?.right) ?? DEFAULT_FADE,
            }}
            colors={colors}
            locations={locations}
          />
        )}
      </View>
    );

  if (fadeColor) {
    return (
      <View {...props} style={style}>
        {props.children}
        {maskElement}
      </View>
    );
  }

  return <MaskedView {...props} style={style} maskElement={maskElement} />;
}

export function FadeView({
  sides = { bottom: true },
  fadeDistance,
  fadeColor,
  ...props
}: FadeViewProps) {
  const { colors, locations } = useMemo(() => {
    const { colors, locations } = easeGradient({
      colorStops: {
        0: {
          color: fadeColor ?? 'white',
        },
        1: {
          color: 'transparent',
        },
      },
    });

    return { colors, locations };
  }, [fadeColor]);

  return (
    <InnerFadeView
      sides={sides}
      fadeDistance={fadeDistance}
      {...props}
      direction="vertical"
      fadeColor={fadeColor}
      colors={colors}
      locations={locations}
    >
      <InnerFadeView
        sides={sides}
        fadeDistance={fadeDistance}
        {...props}
        direction="horizontal"
        fadeColor={fadeColor}
        colors={colors}
        locations={locations}
      />
    </InnerFadeView>
  );
}
