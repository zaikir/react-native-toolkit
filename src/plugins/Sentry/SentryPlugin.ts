import { CaptureConsole } from '@sentry/integrations';
import * as Sentry from '@sentry/react-native';
import type { ReactNativeOptions } from '@sentry/react-native';

import { Plugin, PluginFeature } from '../Plugin';

export class SentryPlugin extends Plugin {
  readonly name = 'SentryPlugin';
  readonly features: PluginFeature[] = ['ErrorTracking'];
  readonly initializationTimeout = 5000;

  constructor(readonly options: ReactNativeOptions) {
    super();
  }

  async initialize() {
    if (!this.options.dsn) {
      throw new Error('Sentry DSN is missing');
    }

    Sentry.init({
      dsn: this.options.dsn,
      // @ts-ignore
      integrations: [new CaptureConsole({ levels: ['warn', 'error'] })],
      ...this.options,
    });
  }
}
