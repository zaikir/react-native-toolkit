import React, {
  createContext,
  PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Animated } from 'react-native';
import { hide as hideNativeSplash } from 'react-native-bootsplash';

export type AppSplashScreenProps = PropsWithChildren<{
  visible: boolean;
  SplashScreen?: React.ReactNode;
  fadeDuration?: number;
  hideManually?: boolean;
}>;

export const SplashScreenContext = createContext<{
  hide: () => void;
}>({} as any);

export default function AppSplashScreen({
  visible,
  SplashScreen,
  children,
  hideManually,
  fadeDuration = 220,
}: AppSplashScreenProps) {
  const [isSplashScreenVisible, setIsSplashScreenVisible] = useState(true);
  const [isAnimationFinished, setIsAnimationFinished] = useState(false);

  const opacityAnim = useRef(new Animated.Value(1)).current;

  const splashScreenContextData = useMemo(
    () => ({
      hide: () => setIsSplashScreenVisible(false),
    }),
    [],
  );

  useEffect(() => {
    if (visible || (hideManually && isSplashScreenVisible)) {
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
      setIsAnimationFinished(true);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, isSplashScreenVisible, hideManually]);

  useEffect(() => {
    if (SplashScreen) {
      hideNativeSplash();
    }
  }, [SplashScreen]);

  if (!SplashScreen) {
    return visible ? null : (children as JSX.Element);
  }

  return (
    <>
      {!visible && (
        <SplashScreenContext.Provider value={splashScreenContextData}>
          {children}
        </SplashScreenContext.Provider>
      )}
      {!isAnimationFinished && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: opacityAnim,
            },
          ]}
        >
          {SplashScreen}
        </Animated.View>
      )}
    </>
  );
}
