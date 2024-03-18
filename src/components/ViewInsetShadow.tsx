import React, { useEffect, useRef, useState } from 'react';
import { ViewProps, View, Image } from 'react-native';
import ViewShot from 'react-native-view-shot';

import { ViewStyle } from './View';
import { InsetShadowProps } from '../types';

export type ViewInsetShadowProps = {
  wrapperProps?: ViewProps;
  innerBorderRadiusStyle: ViewStyle;
} & InsetShadowProps &
  ViewProps;

const cachedShadows: Record<string, string> = {};

export function ViewInsetShadow({
  offsetX,
  offsetY,
  color = 'black',
  blurRadius = 10,
  wrapperProps,
  innerBorderRadiusStyle,
  ...props
}: ViewInsetShadowProps) {
  const viewShotRef = useRef<ViewShot>();
  const onLayoutCalled = useRef(false);

  const invisibleBorderWidth = 20;

  const borderWidth = {
    x: Math.max(invisibleBorderWidth, Math.abs(offsetX ?? 0)) + 5,
    y: Math.max(invisibleBorderWidth, Math.abs(offsetY ?? 0)) + 5,
  };

  const margin = {
    x: borderWidth.x,
    y: borderWidth.x,
  };

  const cacheKey = `${color}_${blurRadius}_${offsetX}_${offsetY}_${JSON.stringify(
    wrapperProps?.style ?? {},
  )}_${JSON.stringify(props.style)}_${JSON.stringify(margin)}`;

  const [imageUri, setImageUri] = useState<string | null>(
    cachedShadows[cacheKey] ?? null,
  );

  const redrawShadow = async () => {
    if (!viewShotRef.current?.capture || cachedShadows[cacheKey]) {
      return;
    }

    onLayoutCalled.current = true;

    const result = await viewShotRef.current.capture();
    cachedShadows[cacheKey] = result;

    setImageUri(result);
  };

  useEffect(() => {
    if (!onLayoutCalled.current || cachedShadows[cacheKey]) {
      return;
    }

    redrawShadow();
  }, [cacheKey]);

  return (
    <View {...wrapperProps}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <ViewShot
          ref={viewShotRef as any}
          options={{
            result: 'tmpfile',
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
                borderBottomLeftRadius:
                  (innerBorderRadiusStyle.borderBottomLeftRadius as number) +
                  borderWidth.x,
                borderBottomRightRadius:
                  (innerBorderRadiusStyle.borderBottomRightRadius as number) +
                  borderWidth.x,
                borderTopLeftRadius:
                  (innerBorderRadiusStyle.borderTopLeftRadius as number) +
                  borderWidth.x,
                borderTopRightRadius:
                  (innerBorderRadiusStyle.borderTopRightRadius as number) +
                  borderWidth.x,
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
      {imageUri && (
        <Image
          source={{
            uri: imageUri,
          }}
          blurRadius={blurRadius}
          style={{
            position: 'absolute',
            left: -margin.x,
            right: -margin.x,
            bottom: -margin.y,
            top: -margin.y,
          }}
        />
      )}
    </View>
  );
}
