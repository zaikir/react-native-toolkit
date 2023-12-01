import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeIdfaAaid from '@sparkfabrik/react-native-idfa-aaid';
import { AppState, NativeEventSubscription } from 'react-native';

import { wait } from '../../utils/promise/wait';
import { Plugin, PluginFeature } from '../Plugin';

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
    const storedIdfa = await AsyncStorage.getItem('__IdfaPlugin__');
    if (storedIdfa) {
      this._idfa = storedIdfa === 'null' ? null : storedIdfa;
      return;
    }

    let subscription: NativeEventSubscription;

    if (AppState.currentState !== 'active') {
      await new Promise<void>((resolve) => {
        subscription = AppState.addEventListener('change', (nextAppState) => {
          if (nextAppState === 'active') {
            resolve();
          }
        });
      });
    }

    // @ts-ignore
    if (subscription) {
      subscription.remove();
    }

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

    await AsyncStorage.setItem(
      '__IdfaPlugin__',
      this._idfa ? this._idfa : 'null',
    );
  }
}
