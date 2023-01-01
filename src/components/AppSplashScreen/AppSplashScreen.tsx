import React, {
  PropsWithChildren, useEffect, useRef, useState,
} from 'react';
import { StyleSheet, Animated } from 'react-native';
import { hide as hideNativeSplash } from 'react-native-bootsplash';

export type AppSplashScreenProps = PropsWithChildren<{
  visible: boolean,
  SplashScreen?: React.ReactNode,
  fadeDuration?: number
}>;

export default function AppSplashScreen({
  visible, SplashScreen, children, fadeDuration = 220,
}: AppSplashScreenProps) {
  console.log(fadeDuration);
  const [isFadeFinished, setIsFadeFinished] = useState(false);
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      return;
    }

    if (!SplashScreen) {
      hideNativeSplash({ fade: true, duration: fadeDuration });
      return;
    }

    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: fadeDuration,
      useNativeDriver: true,
    }).start(() => {
      setIsFadeFinished(true);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    if (SplashScreen) {
      hideNativeSplash();
    }
  }, [SplashScreen]);

  if (visible && !SplashScreen) {
    return null;
  }

  if (!visible && !SplashScreen) {
    return children as JSX.Element;
  }

  return (
    <>
      {!isFadeFinished && (
        <Animated.View style={[StyleSheet.absoluteFill, {
          opacity: opacityAnim,
        }]}
        >
          {SplashScreen}
        </Animated.View>
      )}
      {children}
    </>
  );
}
