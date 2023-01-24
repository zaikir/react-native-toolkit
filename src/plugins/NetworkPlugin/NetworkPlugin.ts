import * as Sentry from '@sentry/react-native';
import { CaptureConsole } from '@sentry/integrations';
import type { ReactNativeOptions } from '@sentry/react-native';
import type {
  InitializationError, InitializationOptions, InitializedPlugin, Plugin, PluginFeature,
} from 'plugins/Plugin';

export class NetworkPlugin implements Plugin {
  readonly name = NetworkPlugin.name;

  readonly features: PluginFeature[] = ['Network'];

  constructor(
    readonly options?: {
      offlineMode?: boolean,
    } & InitializationOptions,
  ) {}

  async init(): Promise<InitializedPlugin | InitializationError> {
    if (!) {
      return { error: 'No internet connection', code: 'offline' };
    }

    Sentry.init({
      dsn: this.options.dsn,
      // @ts-ignore
      integrations: [new CaptureConsole({ levels: ['warn', 'error'] })],
      ...this.options,
    });

    return {
      instance: this,
      data: null,
    };
  }
}
