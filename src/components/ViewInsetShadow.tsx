import React, { useEffect, useRef, useState } from 'react';
import { ViewProps, View, Image } from 'react-native';
import ViewShot from 'react-native-view-shot';

import { InsetShadowProps } from '../types';

export type ViewInsetShadowProps = {
  wrapperProps?: ViewProps;
} & InsetShadowProps &
  ViewProps;

const cachedShadows: Record<string, string> = {};

export function ViewInsetShadow({
  offsetX,
  offsetY,
  color = 'black',
  blurRadius = 10,
  wrapperProps,
  ...props
}: ViewInsetShadowProps) {
  const viewShotRef = useRef<ViewShot>();
  const [image, setImage] = useState<string>();
  const onLayoutCalled = useRef(false);

  const invisibleBorderWidth = 20;

  const borderWidth = {
    x: Math.max(invisibleBorderWidth, Math.abs(offsetX ?? 0)) + 5,
    y: Math.max(invisibleBorderWidth, Math.abs(offsetY ?? 0)) + 5,
  };

  const margin = {
    x: borderWidth.x,
    y: borderWidth.y,
  };

  const redrawShadow = async () => {
    if (!viewShotRef.current?.capture) {
      return;
    }

    onLayoutCalled.current = true;

    const key = `${color}_${blurRadius}_${offsetX}_${offsetY}_${JSON.stringify(
      wrapperProps?.style ?? {},
    )}_${JSON.stringify(props.style)}_${JSON.stringify(margin)}`;

    if (cachedShadows[key]) {
      setImage(cachedShadows[key]);
      return;
    }

    const result = await viewShotRef.current.capture();

    cachedShadows[key] = result.replace(/(\r\n|\n|\r|\s)/gm, '');
    setImage(cachedShadows[key]);
  };

  useEffect(() => {
    if (!onLayoutCalled.current) {
      return;
    }

    redrawShadow();
  }, [color, blurRadius, offsetX, offsetY]);

  return (
    <View {...wrapperProps} style={wrapperProps?.style}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0,
        }}
      >
        <ViewShot
          ref={viewShotRef as any}
          options={{
            result: 'data-uri',
          }}
          style={{
            position: 'absolute',
            left: -margin.x,
            right: -margin.x,
            bottom: -margin.y,
            top: -margin.y,
          }}
        >
          <View
            {...props}
            style={[
              props.style,
              {
                borderColor: color,
                borderLeftWidth: borderWidth.x,
                borderRightWidth: borderWidth.x,
                borderTopWidth: borderWidth.y,
                borderBottomWidth: borderWidth.y,
              },
              {
                left: offsetX,
                top: offsetY,
                height: '100%',
                width: '100%',
              },
            ]}
            onLayout={redrawShadow}
          />
        </ViewShot>
      </View>
      <Image
        source={{ uri: image }}
        blurRadius={blurRadius}
        style={{
          position: 'absolute',
          left: -margin.x,
          right: -margin.x,
          bottom: -margin.y,
          top: -margin.y,
        }}
      />
    </View>
  );
}
