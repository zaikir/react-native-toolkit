import React, {
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { SharedValue, useSharedValue } from 'react-native-reanimated';

import {
  TinderPhotoSwiperCard,
  TinderPhotoSwiperCardProps,
  TinderPhotoSwiperCardRef,
} from './TinderPhotoSwiperCard';
import { View, ViewProps } from '../View';

export type Asset = { uri: string; favorite?: boolean };
export type Anim = {
  left?: number;
  top?: number;
  opacity?: number;
  scale?: number;
  rotation?: number;
  overlayColor?: [number, number, number, number];
};

export type TinderDecision<T extends Asset = Asset> = {
  date: Date;
  decision: 'like' | 'dislike' | 'skip';
  photoId: string;
  asset: TinderPhoto<T>;
};

export type TinderPhoto<T extends Asset = Asset> =
  | ({ id: string } & T)
  | { id: string; loader: () => Promise<T> };

export type TinderPhotoSwiperProps<T extends Asset = Asset> = ViewProps & {
  likeActivationValue?: SharedValue<number>;
  dislikeActivationValue?: SharedValue<number>;
  favouriteActivationValue?: SharedValue<number>;
  photos: TinderPhoto<T>[];
  states: TinderPhotoSwiperCardProps['states'];
  cardProps?: Pick<TinderPhotoSwiperCardProps<T>, 'imageProps'>;
  windowSize?: number;
  onDecisionsChange?: (
    decision: TinderDecision | null,
    allDecisions: IterableIterator<TinderDecision>,
  ) => void;
  onFavoriteChange?: (photo: T, value: boolean) => void;
  onFinish?: () => void;
};

export type TinderPhotoSwiperRef = {
  likePhoto: () => void;
  dislikePhoto: () => void;
  skipPhoto: () => void;
  toggleFavorite: () => void;
  revertDecision: () => void;
};

function TinderPhotoSwiperInner<T extends Asset = Asset>(
  {
    photos: initialPhotos,
    states,
    cardProps,
    likeActivationValue: likeActivationValueRef,
    dislikeActivationValue: dislikeActivationValueRef,
    favouriteActivationValue: favouriteActivationValueRef,
    windowSize = 3,
    onDecisionsChange,
    onFavoriteChange,
    onFinish,
    ...props
  }: TinderPhotoSwiperProps<T>,
  ref: ForwardedRef<TinderPhotoSwiperRef>,
) {
  const [photos] = useState(
    initialPhotos.map((x, idx) => ({
      ...x,
      index: idx,
    })),
  );

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const likeActivationValue = likeActivationValueRef ?? useSharedValue(0);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const dislikeActivationValue = dislikeActivationValueRef ?? useSharedValue(0);

  const favouriteActivationValue =
    // eslint-disable-next-line react-hooks/rules-of-hooks
    favouriteActivationValueRef ?? useSharedValue(0);

  const decisionsRef = useRef<Map<string, TinderDecision>>(
    new Map<string, TinderDecision>(),
  );
  const cardsRef = useRef<Record<string, TinderPhotoSwiperCardRef>>({});
  const activePhotoRef = useRef<TinderPhoto<T>>(photos[photos.length - 1]);

  const refreshActivePhoto = useCallback(() => {
    const activePhotos = photos.filter(
      (photo) => !decisionsRef.current.has(photo.id),
    );
    activePhotoRef.current = activePhotos[activePhotos.length - 1];
  }, []);

  const commitDecision = useCallback(
    (decision: 'like' | 'dislike' | 'skip') => {
      const newDecision = {
        date: new Date(),
        decision,
        photoId: activePhotoRef.current.id,
        asset: activePhotoRef.current,
      };

      decisionsRef.current.set(activePhotoRef.current.id, newDecision);

      refreshStatuses();
      onDecisionsChange?.(newDecision, decisionsRef.current.values());
    },
    [],
  );

  const revertDecision = useCallback(() => {
    const latest = [...decisionsRef.current.values()].sort(
      (a, b) => b.date.valueOf() - a.date.valueOf(),
    )[0];

    if (!latest) {
      return;
    }

    decisionsRef.current.delete(latest.photoId);

    refreshStatuses();
    onDecisionsChange?.(null, decisionsRef.current.values());
  }, []);

  const refreshStatuses = useCallback(() => {
    refreshActivePhoto();

    const activePhotoIndex = (activePhotoRef.current as any)
      ? (activePhotoRef.current as any).index
      : 0;

    [activePhotoIndex - 1, activePhotoIndex, activePhotoIndex + 1].forEach(
      (index) => {
        const photo = photos[index];
        if (!photo) {
          return;
        }

        cardsRef.current[photo.id]?.setStatus(
          decisionsRef.current.get(photo.id)?.decision ??
            (photo.id === activePhotoRef.current.id ? 'active' : 'inactive'),
        );

        cardsRef.current[photo.id]?.setVisibility(
          index >= activePhotoIndex - windowSize &&
            index <= activePhotoIndex + windowSize,
        );
      },
    );

    if (!(activePhotoRef.current as any)) {
      onFinish?.();
    }
  }, []);

  const likePhoto = useCallback(() => {
    if (!activePhotoRef.current) {
      return;
    }

    commitDecision('like');
  }, []);

  const dislikePhoto = useCallback(() => {
    if (!activePhotoRef.current) {
      return;
    }

    commitDecision('dislike');
  }, []);

  const skipPhoto = useCallback(() => {
    if (!activePhotoRef.current) {
      return;
    }

    commitDecision('skip');
  }, []);

  const toggleFavorite = useCallback(() => {
    if (!activePhotoRef.current) {
      return;
    }

    const photo = photos[(activePhotoRef.current as any).index];
    cardsRef.current[photo?.id]?.toggleFavorite();
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      likePhoto,
      dislikePhoto,
      skipPhoto,
      toggleFavorite,
      revertDecision,
    }),
    [],
  );

  useEffect(() => {
    refreshStatuses();
  }, []);

  return (
    <View {...props} style={[{ flex: 1 }, props.style]}>
      {[...initialPhotos].reverse().map((photo) => {
        return (
          <TinderPhotoSwiperCard
            ref={(r) => {
              cardsRef.current[photo.id] = r!;
            }}
            likeActivationValue={likeActivationValue}
            dislikeActivationValue={dislikeActivationValue}
            favouriteActivationValue={favouriteActivationValue}
            key={photo.id}
            id={photo.id as any}
            {...cardProps}
            photo={photo}
            states={states}
            onLike={likePhoto}
            onDislike={dislikePhoto}
            onFavorite={(p, x) => {
              onFavoriteChange?.(p, x);
            }}
            {...{}}
          />
        );
      })}
    </View>
  );
}

export const TinderPhotoSwiper = forwardRef(TinderPhotoSwiperInner) as <
  T extends Asset = Asset,
>(
  props: TinderPhotoSwiperProps<T> & {
    ref?: ForwardedRef<TinderPhotoSwiperRef>;
  },
) => ReturnType<typeof TinderPhotoSwiperInner>;
