import MaskedView from '@react-native-masked-view/masked-view';
import React, { FunctionComponent, ReactNode, useMemo } from 'react';
import {
  StyleProp,
  StyleSheet,
  View as ViewBase,
  ViewProps as ViewPropsBase,
  ViewStyle,
} from 'react-native';
import LinearGradient, {
  LinearGradientProps,
} from 'react-native-linear-gradient';

import { BlurView, BlurViewProps } from './BlurView';

type GradientProps =
  | FunctionComponent
  | Pick<
      LinearGradientProps,
      'style' | 'start' | 'end' | 'locations' | 'colors'
    >;

export type ViewProps = Omit<ViewPropsBase, 'style'> & {
  style?: StyleProp<
    ViewStyle & {
      backgroundGradient?: GradientProps | GradientProps[];
      backgroundBlur?: BlurViewProps['blurType'];
      backgroundBlurProps?: BlurViewProps;
      borderGradient?: GradientProps | GradientProps[];
    }
  >;
};

export function View({ style, children, ...props }: ViewProps) {
  const {
    backgroundGradient: backgroundGradientProp,
    borderGradient: borderGradientProp,
    backgroundBlur,
    backgroundBlurProps,
    ...flattenStyle
  } = useMemo(() => StyleSheet.flatten(style) ?? {}, [style]);

  const backgroundGradients = !backgroundGradientProp
    ? []
    : typeof backgroundGradientProp === 'function'
    ? [backgroundGradientProp]
    : 'length' in backgroundGradientProp
    ? backgroundGradientProp
    : [backgroundGradientProp];

  const borderGradients = !borderGradientProp
    ? []
    : typeof borderGradientProp === 'function'
    ? [borderGradientProp]
    : 'length' in borderGradientProp
    ? borderGradientProp
    : [borderGradientProp];

  const baseStyle: ViewStyle = {
    position: 'absolute',
    width: '100%',
    height: '100%',
  };

  const borderRadiusStyle: ViewStyle = {
    borderBottomLeftRadius:
      flattenStyle.borderBottomLeftRadius ?? flattenStyle.borderRadius ?? 0,
    borderBottomRightRadius:
      flattenStyle.borderBottomRightRadius ?? flattenStyle.borderRadius ?? 0,
    borderTopLeftRadius:
      flattenStyle.borderTopLeftRadius ?? flattenStyle.borderRadius ?? 0,
    borderTopRightRadius:
      flattenStyle.borderTopRightRadius ?? flattenStyle.borderRadius ?? 0,
  };

  const borderWidthStyle: ViewStyle = {
    borderWidth: flattenStyle.borderWidth,
    borderBottomWidth: flattenStyle.borderBottomWidth,
    borderLeftWidth: flattenStyle.borderLeftWidth,
    borderRightWidth: flattenStyle.borderRightWidth,
    borderStartWidth: flattenStyle.borderStartWidth,
    borderTopWidth: flattenStyle.borderTopWidth,
  };

  const borderWidthNegativeStyle: ViewStyle = {
    marginLeft: -(
      flattenStyle.borderLeftWidth ??
      flattenStyle.borderWidth ??
      0
    ),
    marginRight: -(
      flattenStyle.borderRightWidth ??
      flattenStyle.borderWidth ??
      0
    ),
    marginTop: -(flattenStyle.borderTopWidth ?? flattenStyle.borderWidth ?? 0),
    marginBottom: -(
      flattenStyle.borderBottomWidth ??
      flattenStyle.borderWidth ??
      0
    ),
  };

  const borderColorStyle: ViewStyle = {
    borderLeftColor: flattenStyle.borderLeftColor ?? flattenStyle.borderColor,
    borderRightColor: flattenStyle.borderRightColor ?? flattenStyle.borderColor,
    borderTopColor: flattenStyle.borderTopColor ?? flattenStyle.borderColor,
    borderBottomColor:
      flattenStyle.borderBottomColor ?? flattenStyle.borderColor,
  };

  const renderGradient = (gradients: GradientProps[]) => {
    return (
      <>
        {gradients.map((gradient, gradientIdx) => {
          if (typeof gradient === 'function') {
            const Component = gradient;
            return <Component key={gradientIdx} />;
          }

          return (
            <LinearGradient
              key={gradientIdx}
              {...gradient}
              start={gradient.start ?? { x: 0, y: 0 }}
              end={gradient.end ?? { x: 1, y: 1 }}
              style={[
                {
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                },
                gradient.style,
              ]}
            />
          );
        })}
      </>
    );
  };

  const renderAbsolute = (content: ReactNode) => {
    return (
      <ViewBase style={baseStyle} pointerEvents="none">
        <ViewBase
          style={[
            {
              flex: 1,
              overflow: 'hidden',
            },
            borderRadiusStyle,
            borderWidthNegativeStyle,
          ]}
        >
          {content}
        </ViewBase>
      </ViewBase>
    );
  };

  return (
    <ViewBase {...props} style={flattenStyle}>
      {backgroundGradients.length > 0 &&
        renderAbsolute(
          <>
            {renderGradient(backgroundGradients)}
            <ViewBase
              style={[
                baseStyle,
                borderColorStyle,
                borderRadiusStyle,
                borderWidthStyle,
              ]}
            />
          </>,
        )}

      {borderGradients.length > 0 &&
        renderAbsolute(
          <>
            <MaskedView
              style={[baseStyle]}
              maskElement={
                <View
                  style={[baseStyle, borderRadiusStyle, borderWidthStyle]}
                />
              }
            >
              <ViewBase style={[baseStyle]}>
                {renderGradient(borderGradients)}
              </ViewBase>
            </MaskedView>
          </>,
        )}

      {backgroundBlur &&
        renderAbsolute(
          <BlurView
            {...backgroundBlurProps}
            style={[baseStyle, backgroundBlurProps?.style]}
            blurType={backgroundBlurProps?.blurType ?? backgroundBlur}
          />,
        )}

      {children}
    </ViewBase>
  );
}
