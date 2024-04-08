import React from 'react'
import {ViewProps} from '../View'
import {
  ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Dimensions, EasingFunction, Image, ImageProps } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
  ReduceMotion,
  EasingFunctionFactory,
} from 'react-native-reanimated';

import { Anim, Asset, TinderPhoto } from './TinderPhotoSwiper';

type Status = 'active' | 'inactive' | 'like' | 'dislike' | 'skip';

type AnimationConfig = {
  duration?: number;
  reduceMotion?: ReduceMotion;
  easing?: EasingFunction | EasingFunctionFactory;
}

export type TinderPhotoSwiperCardProps<
  T extends Asset = Asset,
  K extends Anim = Anim,
> = ViewProps & {
  photo: TinderPhoto<T>;
  imageProps?: Omit<ImageProps, 'source'>;
  states: Record<Status, K>;
  likeActivationValue: SharedValue<number>;
  dislikeActivationValue: SharedValue<number>;
  favouriteActivationValue: SharedValue<number>;
  resetAnimation?: AnimationConfig;
  swipeAnimation?: AnimationConfig;
  maxActivationTranslation?: { x: number; y: number };
  onLike: () => void;
  onDislike: () => void;
  onFavorite: (photo: T, value: boolean) => void;
};

export type TinderPhotoSwiperCardRef = {
  setStatus: (status: Status) => void;
  setVisibility: (value: boolean) => void;
  toggleFavorite: () => void;
};

const dimensions = Dimensions.get('screen');

function TinderPhotoSwiperCardInner<T extends Asset>({
  status,
  likeActivationValue,
  dislikeActivationValue,
  favouriteActivationValue,
  photo,
  imageProps,
  states,
  resetAnimation = { duration: 300, easing: Easing.out(Easing.ease) },
  swipeAnimation = { duration: 700, easing: Easing.out(Easing.ease) },
  maxActivationTranslation = {
    x: dimensions.width / 4,
    y: dimensions.height / 5,
  },
  onLike,
  onDislike,
  onFavorite,
  ...props
}: Omit<TinderPhotoSwiperCardProps<T>, 'photo'> & {
  photo: T | null;
  status: Status;
}) {
  const state = useSharedValue(states[status]);

  const handleFavorite = () => {
    // @ts-ignore
    onFavorite?.();
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      state.value = {
        ...state.value,
        left: e.translationX,
        top: e.translationY,
      };

      dislikeActivationValue.value =
        Math.abs(Math.min(e.translationX, 0)) / maxActivationTranslation.x;
      likeActivationValue.value =
        Math.abs(Math.max(e.translationX, 0)) / maxActivationTranslation.x;
      favouriteActivationValue.value = interpolate(
        Math.abs(Math.min(e.translationY, 0)) / maxActivationTranslation.y,
        [0, 1],
        !photo?.favorite ? [0, 1] : [1, 0],
        Extrapolate.CLAMP,
      );
    })
    .onEnd((e) => {
      if (status !== 'active') {
        return;
      }

      dislikeActivationValue.value = withTiming(0, resetAnimation);
      likeActivationValue.value = withTiming(0, resetAnimation);

      if (Math.abs(Math.min(e.translationX, 0)) > maxActivationTranslation.x) {
        runOnJS(onDislike)();
        return;
      }

      if (Math.abs(Math.max(e.translationX, 0)) > maxActivationTranslation.x) {
        runOnJS(onLike)();
        return;
      }

      if (
        Math.abs(Math.min(e.translationY, 0)) > maxActivationTranslation.y &&
        photo
      ) {
        runOnJS(handleFavorite)();
      } else {
        favouriteActivationValue.value = interpolate(
          0,
          [0, 1],
          !photo?.favorite ? [0, 1] : [1, 0],
          Extrapolate.CLAMP,
        );
      }

      state.value = withTiming(
        {
          ...state.value,
          left: 0,
          top: 0,
        },
        resetAnimation,
      );
    })
    .enabled(status === 'active');

  const animatedStyle = useAnimatedStyle(
    () => ({
      left: state.value.left ?? 0,
      top: state.value.top ?? 0,
      opacity: state.value.opacity ?? 1,
      transform: [
        { scale: state.value.scale ?? 1 },
        {
          rotate: `${state.value.rotation ?? 0}deg`,
        },
      ],
    }),
    [],
  );

  const overlayAnimatedStyle = useAnimatedStyle(
    () => ({
      ...(state.value.overlayColor && {
        backgroundColor: `rgba(${state.value.overlayColor[0]}, ${state.value.overlayColor[1]}, ${state.value.overlayColor[2]}, ${state.value.overlayColor[3]})`,
      }),
    }),
    [],
  );

  useEffect(() => {
    const newState = states[status];
    state.value = withTiming(newState, swipeAnimation);
  }, [status]);

  useEffect(() => {
    if (status !== 'active') {
      return;
    }

    favouriteActivationValue.value = photo?.favorite ? 1 : 0;
  }, [status, photo?.favorite]);

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        {...props}
        pointerEvents={status === 'active' ? 'auto' : 'none'}
        style={[
          {
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
          },
          props.style,
          animatedStyle,
        ]}
      >
        {photo && (
          <Image
            resizeMode="cover"
            {...imageProps}
            source={{ uri: photo.uri }}
            style={[
              {
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.05)',
              },
              imageProps?.style,
            ]}
          />
        )}
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: -3,
              right: -3,
              top: -3,
              bottom: -3,
            },
            overlayAnimatedStyle,
            imageProps?.style,
          ]}
        />
      </Animated.View>
    </GestureDetector>
  );
}

function TinderPhotoSwiperCardWrapper<T extends Asset>(
  {
    likeActivationValue,
    dislikeActivationValue,
    favouriteActivationValue,
    photo: initialPhoto,
    imageProps,
    states,
    resetAnimation = { duration: 300, easing: Easing.out(Easing.ease) },
    swipeAnimation = { duration: 700, easing: Easing.out(Easing.ease) },
    maxActivationTranslation = {
      x: dimensions.width / 4,
      y: dimensions.height / 4,
    },
    onLike,
    onDislike,
    onFavorite,
    ...props
  }: TinderPhotoSwiperCardProps<T>,
  ref: ForwardedRef<TinderPhotoSwiperCardRef>,
) {
  const photoLoaderRef = useRef(initialPhoto);
  const [photo, setPhoto] = useState(
    !(photoLoaderRef.current as any).loader
      ? (photoLoaderRef.current as unknown as T)
      : null,
  );
  const [status, setStatus] = useState<Status>('inactive');
  const [isVisible, setIsVisible] = useState(false);
  const isPhotoLoaded = useRef(false);

  const toggleFavorite = () => {
    setPhoto((x) =>
      x
        ? {
            ...x,
            favorite: !x.favorite,
          }
        : x,
    );
  };

  useImperativeHandle(
    ref,
    () => ({
      setStatus(value: Status) {
        setStatus(value);
      },
      setVisibility(value) {
        setIsVisible(value);
      },
      toggleFavorite,
    }),
    [],
  );

  useEffect(() => {
    if (!(photoLoaderRef.current as any).loader || !isVisible || photo) {
      return;
    }

    (async () => {
      const value = await (photoLoaderRef.current as any).loader();
      setPhoto(value);
    })();
  }, [photo, isVisible]);

  useEffect(() => {
    if (!photo) {
      return;
    }

    if (!isPhotoLoaded.current) {
      isPhotoLoaded.current = true;
      return;
    }

    onFavorite(photo, !!photo.favorite);
  }, [photo?.favorite]);

  if (!isVisible) {
    return null;
  }

  return (
    <TinderPhotoSwiperCardInner
      {...{
        status,
        likeActivationValue,
        dislikeActivationValue,
        favouriteActivationValue,
        photo,
        imageProps,
        states,
        resetAnimation,
        swipeAnimation,
        maxActivationTranslation,
        onLike,
        onDislike,
        onFavorite: toggleFavorite,
        ...props,
      }}
    />
  );
}

export const TinderPhotoSwiperCard = forwardRef(
  TinderPhotoSwiperCardWrapper,
) as <T extends Asset = Asset>(
  props: TinderPhotoSwiperCardProps<T> & {
    ref?: ForwardedRef<TinderPhotoSwiperCardRef>;
  },
) => ReturnType<typeof TinderPhotoSwiperCardWrapper>;
