import MaskedView from '@react-native-masked-view/masked-view';
import React, { ReactNode, useMemo } from 'react';
import {
  StyleProp,
  StyleSheet,
  View as ViewBase,
  ViewProps as ViewPropsBase,
  ViewStyle as ViewStyleBase,
} from 'react-native';

import { GradientProps, InsetShadowProps } from 'types';
import { renderGradient } from 'utils/renderGradient';

import { BlurView, BlurViewProps } from './BlurView';
import { ViewInsetShadow } from './ViewInsetShadow';
import { ViewSkeleton } from './ViewSkeleton';

export type ViewStyle = ViewStyleBase & {
  backgroundGradient?: GradientProps | GradientProps[];
  backgroundBlur?: BlurViewProps['blurType'];
  backgroundBlurProps?: BlurViewProps;
  borderGradient?: GradientProps | GradientProps[];
  insetShadow?: InsetShadowProps;
};

export type ViewProps = Omit<ViewPropsBase, 'style'> & {
  style?: StyleProp<ViewStyle>;
  skeleton?: boolean;
};

export function View({ style, children, skeleton, ...props }: ViewProps) {
  const {
    backgroundGradient: backgroundGradientProp,
    borderGradient: borderGradientProp,
    backgroundBlur,
    backgroundBlurProps,
    insetShadow,
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
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
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
    borderLeftWidth:
      flattenStyle.borderLeftWidth ?? flattenStyle.borderWidth ?? 0,
    borderRightWidth:
      flattenStyle.borderRightWidth ?? flattenStyle.borderWidth ?? 0,
    borderBottomWidth:
      flattenStyle.borderBottomWidth ?? flattenStyle.borderWidth ?? 0,
    borderTopWidth:
      flattenStyle.borderTopWidth ?? flattenStyle.borderWidth ?? 0,
  };

  const borderColorStyle: ViewStyle = {
    borderLeftColor: flattenStyle.borderLeftColor ?? flattenStyle.borderColor,
    borderRightColor: flattenStyle.borderRightColor ?? flattenStyle.borderColor,
    borderTopColor: flattenStyle.borderTopColor ?? flattenStyle.borderColor,
    borderBottomColor:
      flattenStyle.borderBottomColor ?? flattenStyle.borderColor,
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

  const renderAbsolute = (content: ReactNode, borderAdjust?: boolean) => {
    return (
      <ViewBase
        style={
          borderAdjust
            ? {
                position: 'absolute',
                left: borderWidthStyle.borderLeftWidth! > 0 ? 1 : 0,
                top: borderWidthStyle.borderTopWidth! > 0 ? 1 : 0,
                right: borderWidthStyle.borderRightWidth! > 0 ? 1 : 0,
                bottom: borderWidthStyle.borderBottomWidth! > 0 ? 1 : 0,
              }
            : baseStyle
        }
        pointerEvents="none"
      >
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
    <ViewBase {...props} style={[flattenStyle]}>
      {/* Render background gradient */}
      {backgroundGradients.length > 0 &&
        renderAbsolute(renderGradient(backgroundGradients), true)}

      {/* Render background blur */}
      {backgroundBlur &&
        renderAbsolute(
          <ViewBase
            style={[
              baseStyle,
              borderColorStyle,
              borderRadiusStyle,
              borderWidthStyle,
              { borderColor: 'transparent' },
            ]}
          >
            <BlurView
              {...backgroundBlurProps}
              style={[{ flex: 1 }, backgroundBlurProps?.style]}
              blurType={backgroundBlurProps?.blurType ?? backgroundBlur}
            />
          </ViewBase>,
        )}

      {/* Render inset shadow */}
      {insetShadow &&
        renderAbsolute(
          <ViewBase
            style={[
              baseStyle,
              borderColorStyle,
              borderRadiusStyle,
              borderWidthStyle,
            ]}
          >
            <ViewInsetShadow
              {...insetShadow}
              wrapperProps={{
                style: [baseStyle, borderWidthNegativeStyle],
              }}
              style={[baseStyle, borderRadiusStyle]}
            />
          </ViewBase>,
        )}

      {/* Render default border */}
      {backgroundGradients.length > 0 &&
        !borderGradients.length &&
        renderAbsolute(
          <ViewBase
            style={[
              baseStyle,
              borderColorStyle,
              borderRadiusStyle,
              borderWidthStyle,
            ]}
          />,
        )}

      {/* Render gradient border */}
      {borderGradients.length > 0 &&
        renderAbsolute(
          <MaskedView
            style={baseStyle}
            maskElement={
              <View style={[baseStyle, borderRadiusStyle, borderWidthStyle]} />
            }
          >
            {renderGradient(borderGradients)}
          </MaskedView>,
        )}

      {children}

      {/* Render skeleton */}
      {skeleton &&
        renderAbsolute(
          <ViewSkeleton
            style={[
              {
                position: 'absolute',
                left: -1,
                top: -1,
                right: -1,
                bottom: -1,
              },
              borderColorStyle,
              borderRadiusStyle,
              borderWidthStyle,
            ]}
          />,
        )}
    </ViewBase>
  );
}
