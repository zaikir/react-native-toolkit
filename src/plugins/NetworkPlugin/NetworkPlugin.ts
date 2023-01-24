import {
  InitializationError,
  InitializationOptions,
  InitializedPlugin,
  Plugin,
  PluginFeature,
} from 'plugins/Plugin';
import type { NetworkPluginData } from 'plugins/types';

export class NetworkPlugin extends Plugin {
  readonly name = NetworkPlugin.name;

  readonly features: PluginFeature[] = ['Network'];

  constructor(
    readonly options?: {
      offlineMode?: boolean;
    } & InitializationOptions,
  ) {
    super(options);
  }

  async init(): Promise<InitializedPlugin | InitializationError> {
    if (
      !(this.options?.offlineMode ?? true) &&
      !(await this.isInternetReachable())
    ) {
      return { error: 'No internet connection', code: 'offline' as const };
    }

    return {
      instance: this,
      data: {
        isInternetReachable() {
          return this.isInternetReachable();
        },
      } as NetworkPluginData,
    };
  }

  async isInternetReachable() {
    try {
      await fetch('https://google.com');
      return true;
    } catch {
      return false;
    }
  }
}
