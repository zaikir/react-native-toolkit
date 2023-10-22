import React, {
  FunctionComponent,
  ReactNode,
  Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import {
  Dimensions,
  FlatListProps,
  Image,
  ImageProps,
  ImageSourcePropType,
} from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';

import { ControlledPromise } from 'index';
import { AutoplayAction } from 'utils/AutoplayAction';

import { Text, TextProps } from './Text';
import { View, ViewProps } from './View';

export type FullscreenCarouselContext = {
  progress: SharedValue<number>;
  currentSlideRef: { current: number };
  slidesCount: number;
};

export type FullscreenCarouselRef = {
  scrollTo: (index: number, animated?: boolean) => Promise<boolean>;
  scrollToPrev: (animated?: boolean) => Promise<boolean>;
  scrollToNext: (animated?: boolean) => Promise<boolean>;
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
  loop: boolean;
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
  autoplay?: {
    interval: number;
    delay?: number;
    resetDuration?: number;
  };
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
  loop,
  spacing = 0,
  progressValue,
  edgeOffset = 0,
  autoplay,
  flatListProps,
  slideLayout,
  staticLayout,
  onSlideChanged,
  ...props
}: FullscreenCarouselProps<T>) {
  const flatListRef = useRef<any>(null);
  const activeSlideIndexRef = useRef(0);
  const targetSlideIndexRef = useRef(activeSlideIndexRef.current);
  const allowLastSlideAutoplay = useRef(true);
  const slideProgress = useSharedValue(0);
  const autoplayProgress = useSharedValue(0);
  const autoplayActionRef = useRef<AutoplayAction>();

  const scrollToIndexAwaiterRef = useRef<{
    awaiter: ControlledPromise<boolean>;
    target: number;
  } | null>(null);

  const renderItem = useCallback<NonNullable<FlatListProps<T>['renderItem']>>(
    ({ item }) => {
      return (
        <View
          style={{
            flex: 1,
            width: SCREEN_WIDTH,
            overflow: 'hidden',
            paddingHorizontal: edgeOffset,
            marginBottom: -spacing,
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
          style={[
            position !== 'slide'
              ? { marginBottom: spacing }
              : { paddingBottom: spacing },
            section.wrapperProps?.style,
          ]}
        >
          {(() => {
            const ctx: FullscreenCarouselContext = {
              progress: autoplay ? autoplayProgress : slideProgress,
              slidesCount: slides.length,
              currentSlideRef: activeSlideIndexRef,
            };

            if (section.type === 'indicator') {
              return <section.component {...ctx} />;
            }

            return section.renderItem(ctx);
          })()}
        </View>
      ));
  };

  const scrollTo = useCallback(
    async (index: number, animated = true) => {
      const targetIndex =
        index < 0 ? 0 : index >= slides.length - 1 ? slides.length - 1 : index;

      if (targetIndex === targetSlideIndexRef.current) {
        return true;
      }

      autoplayActionRef.current?.pause();

      targetSlideIndexRef.current = targetIndex;

      if (scrollToIndexAwaiterRef.current) {
        scrollToIndexAwaiterRef.current.awaiter.resolve(false);
        scrollToIndexAwaiterRef.current = null;
      }

      scrollToIndexAwaiterRef.current = {
        awaiter: new ControlledPromise<boolean>(),
        target: targetIndex,
      };

      flatListRef?.current?.scrollToIndex({
        index: targetIndex,
        animated,
      });

      startAutoplay(targetIndex);

      return scrollToIndexAwaiterRef.current.awaiter.wait();
    },
    [slides.length],
  );

  const scrollToPrev = useCallback(async (animated?: boolean) => {
    return scrollTo(targetSlideIndexRef.current - 1, animated);
  }, []);

  const scrollToNext = useCallback(async (animated?: boolean) => {
    return scrollTo(targetSlideIndexRef.current + 1, animated);
  }, []);

  const startAutoplay = useCallback(
    async (slideIndex = activeSlideIndexRef.current) => {
      const isLastSlide = slideIndex === slides.length - 1;

      if (isLastSlide && !allowLastSlideAutoplay.current) {
        return;
      }

      if (isLastSlide) {
        allowLastSlideAutoplay.current = false;
      }

      autoplayActionRef.current?.start(slideIndex);
    },
    [],
  );

  const onScroll = useAnimatedScrollHandler((event) => {
    slideProgress.value = event.contentOffset.x / SCREEN_WIDTH;

    flatListProps?.onScroll?.(event as any);
  }, []);

  const onViewableItemsChanged = useCallback<
    NonNullable<FlatListProps<T>['onViewableItemsChanged']>
  >(({ viewableItems }) => {
    const visibleItem = viewableItems[0];
    if (!visibleItem) {
      return;
    }

    activeSlideIndexRef.current = visibleItem.index!;
    targetSlideIndexRef.current = activeSlideIndexRef.current;

    if (
      scrollToIndexAwaiterRef.current &&
      scrollToIndexAwaiterRef.current.target === visibleItem.index!
    ) {
      scrollToIndexAwaiterRef.current.awaiter.resolve(true);
      scrollToIndexAwaiterRef.current = null;
    }

    if (visibleItem.index! < slides.length - 1) {
      allowLastSlideAutoplay.current = true;
    }

    onSlideChanged?.(visibleItem.index!);
  }, []);

  useEffect(() => {
    if (!autoplay) {
      return;
    }

    autoplayActionRef.current = new AutoplayAction(
      autoplayProgress,
      autoplay.interval,
      {
        delay: autoplay.delay ?? 1000,
        resetDuration: autoplay.resetDuration ?? 300,
        async onFinish() {
          scrollToNext();
        },
      },
    );

    startAutoplay();

    return () => {
      autoplayActionRef.current?.reset();
    };
  }, []);

  useImperativeHandle(
    controlRef,
    () => ({
      scrollTo,
      scrollToPrev,
      scrollToNext,
    }),
    [scrollTo, scrollToPrev, scrollToNext],
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
          showsHorizontalScrollIndicator={
            flatListProps?.showsHorizontalScrollIndicator ?? false
          }
          onScroll={onScroll}
          scrollEventThrottle={flatListProps?.scrollEventThrottle ?? 16}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{
            viewAreaCoveragePercentThreshold: 60,
          }}
          onScrollBeginDrag={(e) => {
            autoplayActionRef.current?.pause();

            flatListProps?.onScrollBeginDrag?.(e);
          }}
          onScrollEndDrag={(e) => {
            const slideWidth = e.nativeEvent.layoutMeasurement.width;
            const targetSlide = Math.round(
              e.nativeEvent.targetContentOffset?.x! / slideWidth,
            );

            startAutoplay(targetSlide);

            flatListProps?.onScrollEndDrag?.(e);

            allowLastSlideAutoplay.current = true;
          }}
          style={[{ marginBottom: spacing ?? 0 }, flatListProps?.style]}
          contentContainerStyle={flatListProps?.contentContainerStyle}
        />

        {renderStaticLayout('slide')}
      </View>

      {renderStaticLayout('bottom')}
    </View>
  );
}
