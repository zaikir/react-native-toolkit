import ReactNativeIdfaAaid from '@sparkfabrik/react-native-idfa-aaid';
import { AppState, NativeEventSubscription } from 'react-native';

import { Plugin, PluginFeature } from 'plugins/Plugin';

import { wait } from '../../utils/promise/wait';

export class IdfaPlugin extends Plugin {
  readonly name = 'IdfaPlugin';
  readonly features: PluginFeature[] = ['IDFA'];
  readonly initializationTimeout = null;

  private _idfa: string | null = null;

  constructor(readonly options: { delay?: number }) {
    super();
  }

  public get idfa() {
    return this._idfa;
  }

  async initialize() {
    let subscription: NativeEventSubscription;
    await new Promise<void>((resolve) => {
      subscription = AppState.addEventListener('change', (nextAppState) => {
        if (nextAppState === 'active') {
          resolve();
        }
      });
    });

    subscription!.remove();

    if (this.options.delay) {
      await wait(this.options.delay ?? 100);
    }

    try {
      const res = await ReactNativeIdfaAaid.getAdvertisingInfo();
      if (!res.id) {
        return;
      }

      this._idfa = res.id!;
    } catch {
      // no-op
    }
  }
}
