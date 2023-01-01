import Sentry from '@sentry/react-native';
import { CaptureConsole } from '@sentry/integrations';
import type { ReactNativeOptions } from '@sentry/react-native';
import type { Plugin } from 'plugins/Plugin';

export class SentryPlugin implements Plugin {
  readonly name = SentryPlugin.name;

  constructor(
    readonly options?: ReactNativeOptions,
  ) {}

  async init() {
    if (!process.env.SENTRY_DSN && !this.options?.dsn) {
      throw new Error('Sentry DSN required. Pass it using SENTRY_DSN env variable or via constructor');
    }

    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      integrations: [new CaptureConsole({ levels: ['warn', 'error'] })],
      ...this.options,
    });
  }
}
