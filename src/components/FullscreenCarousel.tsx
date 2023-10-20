import React, {
  FunctionComponent,
  ReactNode,
  Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
  FlatListProps,
  Image,
  ImageProps,
  ImageSourcePropType,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  Easing,
  SharedValue,
  cancelAnimation,
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Text, TextProps } from './Text';
import { View, ViewProps } from './View';

export type FullscreenCarouselContext = {
  progress: SharedValue<number>;
  activeSlide: number;
  slidesCount: number;
};

export type FullscreenCarouselRef = {
  scrollToPrev: () => void;
  scrollToNext: () => void;
};

export type SlideLayoutSection<T> = (
  | {
      type: 'image';
      valueGetter: (item: T) => ImageSourcePropType;
      renderItem?: (item: T) => ReactNode;
      imageProps?: ((item: T) => ImageProps) | ImageProps;
      imageContainerProps?: ((item: T) => ViewProps) | ViewProps;
      wrapperProps?: ((item: T) => ViewProps) | ViewProps;
    }
  | {
      type: 'text';
      valueGetter: (item: T) => string;
      textProps?: ((item: T) => TextProps) | TextProps;
      wrapperProps?: ((item: T) => ViewProps) | ViewProps;
    }
  | {
      type: 'custom';
      renderItem?: (item: T) => ReactNode;
      wrapperProps?: ((item: T) => ViewProps) | ViewProps;
    }
) & { hidden?: (item: T) => boolean };

export type StaticLayoutSection = (
  | {
      type: 'indicator';
      component: FunctionComponent<FullscreenCarouselContext>;
      wrapperProps?: ViewProps;
    }
  | {
      type: 'custom';
      renderItem: (context: FullscreenCarouselContext) => ReactNode;
      wrapperProps?: ViewProps;
    }
) & {
  position: 'top' | 'slide' | 'bottom';
};

export type FullscreenCarouselProps<
  T extends Record<string, any> = Record<string, any>,
> = {
  controlRef?: Ref<FullscreenCarouselRef>;
  spacing?: number;
  edgeOffset?: number;
  progressValue?: SharedValue<number>;
  slides: T[];
  slideLayout: {
    sections: SlideLayoutSection<T>[];
  };
  staticLayout: {
    sections: StaticLayoutSection[];
  };
  flatListProps?: Omit<FlatListProps<T>, 'data' | 'renderItem' | 'horizontal'>;
  autoplay?: boolean;
  autoplayInterval?: number;
  autoplaySlideChangeDuration?: number;
  style?: FlatListProps<T>['style'];
  onSlideChanged?: (slideIndex: number) => void;
};

const SCREEN_WIDTH = Dimensions.get('screen').width;

const unwrapProps = (
  props?: Record<string, any>,
  item?: Record<string, any>,
): Record<string, any> =>
  typeof props === 'function' ? props(item ?? {}) : props ?? {};

export function FullscreenCarousel<
  T extends Record<string, any> = Record<string, any>,
>({
  controlRef,
  slides,
  spacing,
  progressValue,
  edgeOffset = 0,
  autoplay = false,
  autoplayInterval = 7000,
  autoplaySlideChangeDuration = 400,
  flatListProps,
  slideLayout,
  staticLayout,
  onSlideChanged,
  ...props
}: FullscreenCarouselProps<T>) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const slideProgress = progressValue ? progressValue : useSharedValue(0);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const autoplayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const flatListRef = useRef<any>(null);

  const renderItem = useCallback<NonNullable<FlatListProps<T>['renderItem']>>(
    ({ item }) => {
      return (
        <View
          style={{
            flex: 1,
            width: SCREEN_WIDTH,
            overflow: 'hidden',
            paddingHorizontal: edgeOffset,
          }}
        >
          {slideLayout.sections.map((section, sectionIdx) => {
            if (section?.hidden?.(item)) {
              return null;
            }

            const wrapperProps = unwrapProps(section.wrapperProps, item);

            return (
              <View
                {...wrapperProps}
                key={sectionIdx}
                style={[
                  { marginBottom: spacing },
                  ...(section.type === 'image'
                    ? [
                        {
                          flex: 1,
                          justifyContent: 'center' as const,
                          marginHorizontal: -edgeOffset,
                        },
                      ]
                    : section.type === 'text'
                    ? [
                        {
                          alignItems: 'center' as const,
                        },
                      ]
                    : []),
                  wrapperProps.style,
                ]}
              >
                {(() => {
                  if (section.type === 'image') {
                    const imageContainerProps = unwrapProps(
                      section.imageContainerProps,
                      item,
                    );

                    const imageProps = unwrapProps(section.imageProps, item);

                    return (
                      <View
                        {...imageContainerProps}
                        style={[
                          {
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                          },
                          imageContainerProps?.style,
                        ]}
                      >
                        <Image
                          {...imageProps}
                          source={section.valueGetter(item)}
                          resizeMode="contain"
                          style={[
                            {
                              width: '100%',
                              height: '100%',
                            },
                            imageProps?.style,
                          ]}
                        />
                      </View>
                    );
                  }

                  if (section.type === 'text') {
                    const textProps = unwrapProps(section.textProps, item);

                    return (
                      <Text
                        {...textProps}
                        style={[
                          {
                            textAlign: 'center',
                          },
                          textProps?.style,
                        ]}
                      >
                        {section.valueGetter(item)}
                      </Text>
                    );
                  }

                  return section.renderItem?.(item);
                })()}
              </View>
            );
          })}
        </View>
      );
    },
    [slideLayout],
  );

  const renderStaticLayout = (position: 'top' | 'slide' | 'bottom') => {
    return staticLayout.sections
      .filter((section) => section.position === position)
      .map((section, sectionIdx) => (
        <View
          {...section.wrapperProps}
          key={sectionIdx}
          style={{ marginBottom: spacing }}
        >
          {(() => {
            if (section.type === 'indicator') {
              return (
                <section.component
                  progress={slideProgress}
                  slidesCount={slides.length}
                  activeSlide={activeSlideIndex}
                />
              );
            }

            return section.renderItem({
              activeSlide: activeSlideIndex,
              progress: slideProgress,
              slidesCount: slides.length,
            });
          })()}
        </View>
      ));
  };

  const scrollToPrev = useCallback(() => {
    setActiveSlideIndex((prev) => {
      if (prev <= 0) {
        return prev;
      }

      return prev - 1;
    });
  }, [slides.length]);

  const scrollToNext = useCallback(() => {
    setActiveSlideIndex((prev) => {
      if (prev >= slides.length - 1) {
        return prev;
      }

      return prev + 1;
    });
  }, [slides.length]);

  const startAutoplay = useCallback(() => {
    if (autoplayTimeoutRef.current) {
      clearTimeout(autoplayTimeoutRef.current);
      autoplayTimeoutRef.current = null;
    }

    if (!autoplay) {
      return;
    }

    cancelAnimation(slideProgress);

    slideProgress.value = withTiming(activeSlideIndex + 1, {
      duration: autoplayInterval,
      easing: Easing.linear,
    });

    autoplayTimeoutRef.current = setTimeout(() => {
      scrollToNext();
    }, autoplayInterval);
  }, [activeSlideIndex, autoplay, scrollToNext]);

  const onScroll = useAnimatedScrollHandler((event) => {
    slideProgress.value = event.contentOffset.x / SCREEN_WIDTH;
  }, []);

  useEffect(() => {
    (async () => {
      if (!autoplay) {
        return;
      }

      flatListRef?.current.scrollToIndex({
        index: activeSlideIndex,
      });

      onSlideChanged?.(activeSlideIndex);

      cancelAnimation(slideProgress);

      slideProgress.value = withTiming(
        activeSlideIndex,
        {
          duration: autoplaySlideChangeDuration,
        },
        (isFinished) => {
          if (isFinished) {
            runOnJS(startAutoplay)();
          }
        },
      );
    })();
  }, [activeSlideIndex, autoplay, scrollToNext, startAutoplay]);

  useEffect(() => {
    (async () => {
      if (autoplay) {
        return;
      }

      onSlideChanged?.(activeSlideIndex);
    })();
  }, [activeSlideIndex, autoplay]);

  useImperativeHandle(
    controlRef,
    () => ({
      scrollToPrev,
      scrollToNext,
    }),
    [scrollToPrev, scrollToNext],
  );

  return (
    <View
      {...props}
      style={[{ flex: 1, marginBottom: -(spacing ?? 0) }, props.style]}
    >
      {renderStaticLayout('top')}

      <View
        style={{
          flex: 1,
          marginHorizontal: -edgeOffset,
        }}
      >
        <Animated.FlatList
          {...flatListProps}
          ref={flatListRef}
          data={slides}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          scrollEnabled={!autoplay}
          {...(!autoplay && {
            onScroll,
            scrollEventThrottle: 16,
          })}
          style={[flatListProps?.style]}
          contentContainerStyle={flatListProps?.contentContainerStyle}
        />
        {renderStaticLayout('slide')}
      </View>

      {autoplay && (
        <View
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
          }}
          pointerEvents="box-none"
        >
          <View
            style={{
              position: 'relative',
              flex: 1,
              marginHorizontal: -edgeOffset,
            }}
          >
            <TouchableOpacity
              onPress={scrollToPrev}
              style={{
                position: 'absolute',
                width: '30%',
                height: '100%',
              }}
            />
            <TouchableOpacity
              onPress={scrollToNext}
              style={{
                position: 'absolute',
                width: '30%',
                height: '100%',
                right: 0,
              }}
            />
          </View>
        </View>
      )}

      {renderStaticLayout('bottom')}
    </View>
  );
}
