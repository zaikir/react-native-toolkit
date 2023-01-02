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
    if (!this.options?.dsn) {
      DropdownAlert.ref.alertWithType('error', 'Error', 'Sentry DSN is missing');
      return false;
    }

    Sentry.init({
      dsn: this.options.dsn,
      // @ts-ignore
      integrations: [new CaptureConsole({ levels: ['warn', 'error'] })],
      ...this.options,
    });

    return true;
  }
}
