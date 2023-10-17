import React from 'react';
import { Dimensions } from 'react-native';
import {
  Defs,
  RadialGradient as SvgRadialGradient,
  Rect,
  Stop,
  Svg,
  SvgProps,
} from 'react-native-svg';

export type RadialGradientProps = {
  layout?: { width: number; height: number };
  center: { x: number; y: number };
  radius: number | { x: number; y: number };
  colors: { offset: number; color: string; opacity: number }[];
  style: SvgProps['style'];
  svgProps?: SvgProps;
};

export function RadialGradient({
  layout = {
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height,
  },
  center,
  radius,
  colors,
  style,
  svgProps,
}: RadialGradientProps) {
  const colorsList = colors.map((color, colorIdx) => (
    <Stop
      key={colorIdx}
      offset={color.offset}
      stopColor={color.color}
      stopOpacity={color.opacity}
    />
  ));

  return (
    <Svg
      {...svgProps}
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      fill="none"
      style={[
        {
          width: layout.width,
          height: layout.height,
        },
        style,
      ]}
    >
      <Rect
        width={layout.width}
        height={layout.height}
        fill="url(#radial_gradient_brush)"
        fillOpacity="1"
      />
      <Defs>
        <SvgRadialGradient
          id="radial_gradient_brush"
          cx={center.x}
          cy={center.y}
          gradientUnits="userSpaceOnUse"
          {...(typeof radius === 'number'
            ? {
                r: radius,
              }
            : {
                rx: radius.x,
                ry: radius.y,
              })}
        >
          {colorsList}
        </SvgRadialGradient>
      </Defs>
    </Svg>
  );
}
