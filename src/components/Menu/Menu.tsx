import { Portal } from '@gorhom/portal';
import { useFocusEffect } from '@react-navigation/native';
import React, {
  cloneElement,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  LayoutRectangle,
  TouchableWithoutFeedback,
  View,
  ViewProps,
} from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { scaleY } from '../../utils/scale';

export type MenuProps = {
  button: JSX.Element;
  children: React.ReactNode;
  anchor?: {
    vertical: 'top' | 'center' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
  position?: {
    vertical: 'top' | 'center' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
  offset?: {
    vertical: number;
    horizontal: number;
  };
  overlayColor?: string;
  style?: ViewProps['style'];
};

export type MenuContextType = {
  isOpened: boolean;
  openMenu: () => void;
  closeMenu: () => void;
};

export const MenuContext = createContext<MenuContextType>({} as any);

export function Menu({
  button: originalButton,
  children,
  anchor,
  position,
  offset,
  overlayColor,
  style,
}: MenuProps) {
  const [isOpened, setIsOpened] = useState(false);
  const animSharedValue = useSharedValue(0);
  const buttonRef = useRef<any>();
  const buttonLayoutRef = useRef<LayoutRectangle>();
  const menuLayoutRef = useRef<LayoutRectangle>();
  const menuRef = useRef<any>();

  const layoutView = (
    <View
      key="unique"
      ref={buttonRef}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
      }}
      pointerEvents="none"
      onLayout={() => {
        if (buttonLayoutRef.current) {
          return;
        }

        buttonRef.current!.measureInWindow(
          (left: number, top: number, width: number, height: number) => {
            buttonLayoutRef.current = { x: left, y: top, width, height };
          },
        );
      }}
    />
  );

  const button = cloneElement(originalButton, {
    children: originalButton.props.children?.length
      ? [...originalButton.props.children, layoutView]
      : [originalButton.props.children, layoutView],
    onPress: (...args: any) => {
      originalButton?.props?.onPress?.(...args);
      setIsOpened((x) => !x);
    },
  });

  const { left, top } = useMemo(() => {
    if (!buttonLayoutRef.current || !menuLayoutRef.current) {
      return {
        left: 0,
        top: 0,
      };
    }

    const anchorPointX =
      buttonLayoutRef.current.x +
      (anchor?.horizontal === 'right'
        ? buttonLayoutRef.current.width
        : anchor?.horizontal === 'center'
        ? buttonLayoutRef.current.width / 2
        : 0);

    const anchorPointY =
      buttonLayoutRef.current.y +
      (anchor?.vertical === 'top'
        ? 0
        : anchor?.vertical === 'center'
        ? buttonLayoutRef.current.height / 2
        : buttonLayoutRef.current.height);

    const transformX =
      (offset?.horizontal ?? 0) +
      (position?.horizontal === 'left'
        ? -menuLayoutRef.current.width
        : position?.horizontal === 'center'
        ? -menuLayoutRef.current.width / 2
        : 0);

    const transformY =
      (offset?.vertical ?? 0) +
      (position?.vertical === 'top'
        ? -menuLayoutRef.current.height
        : position?.vertical === 'center'
        ? -menuLayoutRef.current.height / 2
        : 0);

    return {
      left: anchorPointX + transformX,
      top: anchorPointY + transformY,
    };
  }, [anchor, position, isOpened]);

  const menuData = useMemo<MenuContextType>(
    () => ({
      isOpened,
      closeMenu: () => setIsOpened(false),
      openMenu: () => setIsOpened(true),
    }),
    [isOpened],
  );

  const animatedOverlayStyle = useAnimatedStyle(
    () => ({
      backgroundColor: overlayColor
        ? interpolateColor(
            animSharedValue.value,
            [0, 1],
            ['rgba(0,0,0,0)', overlayColor],
          )
        : 'transparent',
    }),
    [],
  );

  const animatedMenuStyle = useAnimatedStyle(
    () => ({
      opacity: animSharedValue.value,
    }),
    [],
  );

  useFocusEffect(
    useCallback(() => {
      return () => {
        setIsOpened(false);
      };
    }, []),
  );

  useEffect(() => {
    animSharedValue.value = withTiming(isOpened ? 1 : 0, { duration: 100 });
  }, [isOpened]);

  return (
    <>
      {button}
      <Portal hostName="ModalHost">
        <MenuContext.Provider value={menuData}>
          <TouchableWithoutFeedback
            onPress={() => {
              setIsOpened(false);
            }}
          >
            <Animated.View
              style={[{ flex: 1 }, animatedOverlayStyle]}
              pointerEvents={isOpened ? 'auto' : 'none'}
            >
              <Animated.View
                ref={menuRef}
                onLayout={() => {
                  if (menuLayoutRef.current) {
                    return;
                  }

                  menuRef.current!.measureInWindow(
                    (
                      left: number,
                      top: number,
                      width: number,
                      height: number,
                    ) => {
                      menuLayoutRef.current = {
                        x: left,
                        y: top,
                        width,
                        height,
                      };
                    },
                  );
                }}
                style={[
                  {
                    position: 'absolute',
                    left,
                    top,
                    shadowColor: 'black',
                    shadowOpacity: 0.1,
                    shadowOffset: { width: 0, height: scaleY(4) },
                    backgroundColor: 'white',
                  },
                  style,
                  animatedMenuStyle,
                ]}
              >
                {children}
              </Animated.View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </MenuContext.Provider>
      </Portal>
    </>
  );
}
