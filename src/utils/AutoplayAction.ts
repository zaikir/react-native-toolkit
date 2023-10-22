import { EasingFunction } from 'react-native';
import {
  Easing,
  EasingFunctionFactory,
  SharedValue,
  cancelAnimation,
  runOnJS,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { PromiseUtils } from './promise/utils';

export class AutoplayAction {
  private startValue = 0;
  private endValue = 1;

  constructor(
    public readonly progress: SharedValue<number>,
    private readonly duration: number,
    private readonly options?: {
      easing?: EasingFunction | EasingFunctionFactory;

      delay?: number;
      resetDuration?: number;
      resetEasing?: EasingFunction | EasingFunctionFactory;
      onFinish?: () => void;
      onReset?: () => void;
    },
  ) {}

  async start(start?: number, end?: number) {
    this.startValue = start ?? 0;
    this.endValue = end ?? this.startValue + 1;

    cancelAnimation(this.progress);

    const onFinish = this.options?.onFinish;

    this.progress.value = withSequence(
      withTiming(this.startValue, {
        duration: this.options?.resetDuration ?? 200,
        easing:
          this.options?.resetEasing ?? this.options?.easing ?? Easing.linear,
      }),
      withDelay(
        this.options?.delay ?? 0,
        withTiming(
          this.endValue,
          {
            duration: this.duration,
            easing: this.options?.easing ?? Easing.linear,
          },
          (isFinished) => {
            if (!isFinished) {
              return;
            }

            if (onFinish) {
              runOnJS(onFinish)();
            }
          },
        ),
      ),
    );
  }

  async reset(start?: number, end?: number) {
    this.startValue = start ?? this.startValue;
    this.endValue = end ?? this.endValue ?? this.startValue + 1;

    cancelAnimation(this.progress);

    const onReset = this.options?.onReset;

    const resetDuration = this.options?.resetDuration ?? 200;
    this.progress.value = withTiming(
      this.startValue,
      {
        duration: resetDuration,
        easing:
          this.options?.resetEasing ?? this.options?.easing ?? Easing.linear,
      },
      (isFinished) => {
        if (!isFinished) {
          return;
        }

        if (onReset) {
          runOnJS(onReset)();
        }
      },
    );

    await PromiseUtils.wait(resetDuration);
  }

  pause() {
    cancelAnimation(this.progress);
  }

  stop() {
    cancelAnimation(this.progress);
    this.progress.value = this.startValue;
  }
}
