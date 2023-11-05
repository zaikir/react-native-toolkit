import { atom, createStore, useAtom, Provider } from 'jotai';
import React, {
  FunctionComponent,
  ReactNode,
  Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
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
  TouchableOpacityProps,
} from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';

import { ControlledPromise, scaleX } from 'index';
import { AutoplayAction } from 'utils/AutoplayAction';

import { Text, TextProps } from './Text';
import { View, ViewProps } from './View';

export type FullscreenCarouselContext = {
  progress: SharedValue<number>;
  slideIndex: number;
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
      valueGetter: (item: T, index: number) => ImageSourcePropType;
      renderItem?: (item: T, index: number) => ReactNode;
      imageProps?:
        | ((item: T, index: number) => Partial<ImageProps>)
        | Partial<ImageProps>;
      imageContainerProps?: ((item: T, index: number) => ViewProps) | ViewProps;
      wrapperProps?: ((item: T, index: number) => ViewProps) | ViewProps;
    }
  | {
      type: 'text';
      valueGetter: (item: T, index: number) => string;
      textProps?: ((item: T, index: number) => TextProps) | TextProps;
      wrapperProps?: ((item: T, index: number) => ViewProps) | ViewProps;
    }
  | {
      type: 'custom';
      renderItem?: (item: T, index: number) => ReactNode;
      wrapperProps?: ((item: T, index: number) => ViewProps) | ViewProps;
    }
) & { hidden?: (item: T, index: number) => boolean };

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

export const SelectedSlideIndexAtom = atom(0);

function ControlButton({
  direction,
  slidesCount,
  ...props
}: TouchableOpacityProps & {
  slidesCount: number;
  direction: 'left' | 'right';
}) {
  const [slideIndex] = useAtom(SelectedSlideIndexAtom);
  const isDisabled =
    (direction === 'left' && slideIndex <= 0) ||
    (direction === 'right' && slideIndex >= slidesCount - 1);

  return (
    <TouchableOpacity
      {...props}
      hitSlop={scaleX(20)}
      disabled={isDisabled}
      style={[props.style, isDisabled && { opacity: 0.3 }]}
    />
  );
}

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
  width?: number | 'auto' | 'screen';
  controls?: {
    type: 'none' | 'buttons' | 'fullscreen';
    buttonsOffset?: number;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
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
  spacing = 0,
  controls,
  progressValue,
  edgeOffset = 0,
  autoplay,
  flatListProps,
  slideLayout,
  staticLayout,
  width: widthProp = 'screen',
  onSlideChanged,
  ...props
}: FullscreenCarouselProps<T>) {
  const store = useMemo(() => createStore(), []);

  const [width, setWidth] = useState(
    widthProp === 'screen'
      ? SCREEN_WIDTH
      : typeof widthProp === 'number'
      ? widthProp
      : 0,
  );
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
    ({ item, index }) => {
      return (
        <View
          style={{
            flex: 1,
            width,
            overflow: 'hidden',
            paddingHorizontal: edgeOffset,
            marginBottom: -spacing,
          }}
        >
          {slideLayout.sections.map((section, sectionIdx) => {
            if (section?.hidden?.(item, index)) {
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
                          source={section.valueGetter(item, index)}
                          resizeMode={imageProps?.resizeMode ?? 'contain'}
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
                        {section.valueGetter(item, index)}
                      </Text>
                    );
                  }

                  return section.renderItem?.(item, index);
                })()}
              </View>
            );
          })}
        </View>
      );
    },
    [slideLayout, width],
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
              slideIndex: store.get(SelectedSlideIndexAtom),
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
    slideProgress.value = event.contentOffset.x / width!;

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

    store.set(SelectedSlideIndexAtom, visibleItem.index!);
    onSlideChanged?.(visibleItem.index!);
  }, []);

  useEffect(() => {
    store.set(SelectedSlideIndexAtom, flatListProps?.initialScrollIndex ?? 0);
  }, [store]);

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
    <Provider store={store}>
      <View
        {...props}
        style={[{ flex: 1, marginBottom: -(spacing ?? 0) }, props.style]}
        {...(widthProp === 'auto'
          ? {
              onLayout: (e) => {
                setWidth(e.nativeEvent.layout.width);
              },
            }
          : {})}
      >
        {renderStaticLayout('top')}

        <View
          style={{
            flex: 1,
            marginHorizontal: -edgeOffset,
          }}
        >
          {!!width && (
            <>
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
            </>
          )}

          {(controls?.type === 'buttons' ||
            controls?.type === 'fullscreen') && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: spacing ?? 0,
              }}
            >
              {controls.type === 'fullscreen' && (
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
                    }}
                  >
                    <ControlButton
                      onPress={() => {
                        scrollToPrev();
                      }}
                      direction="left"
                      style={{
                        position: 'absolute',
                        width: '50%',
                        height: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      slidesCount={slides.length}
                    >
                      {controls?.leftIcon}
                    </ControlButton>
                    <ControlButton
                      onPress={() => {
                        scrollToNext();
                      }}
                      direction="right"
                      style={{
                        position: 'absolute',
                        width: '50%',
                        height: '100%',
                        right: 0,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      slidesCount={slides.length}
                    >
                      {controls?.rightIcon}
                    </ControlButton>
                  </View>
                </View>
              )}

              {controls.type === 'buttons' && (
                <View
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    paddingHorizontal: controls?.buttonsOffset ?? scaleX(10),
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  pointerEvents="box-none"
                >
                  <ControlButton
                    onPress={() => {
                      scrollToPrev();
                    }}
                    direction="left"
                    slidesCount={slides.length}
                  >
                    {controls?.leftIcon}
                  </ControlButton>

                  <View style={{ flex: 1 }} />
                  <ControlButton
                    onPress={() => {
                      scrollToNext();
                    }}
                    direction="right"
                    slidesCount={slides.length}
                  >
                    {controls?.rightIcon}
                  </ControlButton>
                </View>
              )}
            </View>
          )}
        </View>
        {!!width && renderStaticLayout('bottom')}
      </View>
    </Provider>
  );
}
