import React, {
  PropsWithChildren, useEffect, useRef, useState,
} from 'react';
import { Animated } from 'react-native';
import { hide as hideNativeSplash } from 'react-native-bootsplash';

export type AppSplashScreenProps = PropsWithChildren<{
  visible: boolean,
  SplashScreen?: React.ReactNode,
  fadeDuration?: number
}>;

export default function AppSplashScreen({
  visible, SplashScreen, children, fadeDuration = 220,
}: AppSplashScreenProps) {
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

  if (!SplashScreen) {
    return visible ? null : children as JSX.Element;
  }

  return (
    <>
      {children}
      {!isFadeFinished && (
        <Animated.View style={[{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: opacityAnim,
        }]}
        >
          {SplashScreen}
        </Animated.View>
      )}
    </>
  );
}
