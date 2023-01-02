import * as Sentry from '@sentry/react-native';
import { CaptureConsole } from '@sentry/integrations';
import type { ReactNativeOptions } from '@sentry/react-native';
import type { Plugin } from 'plugins/Plugin';
import { DropdownAlert } from 'contexts/AlertsContext';

export class SentryPlugin implements Plugin {
  readonly name = SentryPlugin.name;

  constructor(
    readonly options?: ReactNativeOptions,
  ) {}

  async init() {
    if (!process.env.SENTRY_DSN && !this.options?.dsn) {
      DropdownAlert.ref.alertWithType('error', 'Error', 'Sentry DSN required. Use SENTRY_DSN env variable or pass it in the constructor');
      return false;
    }

    Sentry.init({
      dsn: this.options?.dsn || process.env.SENTRY_DSN,
      // @ts-ignore
      integrations: [new CaptureConsole({ levels: ['warn', 'error'] })],
      ...this.options,
    });

    return true;
  }
}
