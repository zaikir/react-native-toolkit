import initializeRemoteConfig from '@react-native-firebase/remote-config';

import { timeout } from 'index';
import { Plugin, PluginFeature } from 'plugins/Plugin';
import type { IRemoteConfigPlugin, RemoteConfig } from 'plugins/types';

export class FirebasePlugin extends Plugin implements IRemoteConfigPlugin {
  readonly name = 'FirebasePlugin';

  readonly features: PluginFeature[] = ['RemoteConfig'];

  _remoteConfig: RemoteConfig;

  get remoteValues() {
    return this._remoteConfig;
  }

  constructor(options: { remoteConfig?: RemoteConfig }) {
    super();
    this._remoteConfig = options.remoteConfig ?? {};
  }

  async initialize() {
    if (this._remoteConfig) {
      const config = initializeRemoteConfig();

      try {
        await timeout(async () => {
          await config.setConfigSettings({ minimumFetchIntervalMillis: 0 });
          await config.setDefaults({ ...this._remoteConfig });

          await config.fetch(0);
          await config.activate();
        });

        this._remoteConfig = Object.fromEntries(
          Object.entries(config.getAll()).map(([key, entry]) => {
            // @ts-ignore
            const defaultValue = this._remoteConfig[key];

            if (!defaultValue) {
              try {
                // @ts-ignore
                const parsed = JSON.parse(entry._value);
                return [key, parsed];
              } catch {
                return [key, entry.asString()];
              }
            }

            if (typeof defaultValue === 'string') {
              return [key, entry.asString()];
            }

            if (typeof defaultValue === 'boolean') {
              return [key, entry.asBoolean()];
            }

            if (typeof defaultValue === 'number') {
              return [key, entry.asNumber()];
            }

            // @ts-ignore
            return [key, JSON.parse(entry._value)];
          }),
        );
      } catch {
        // no op
      }
    }
  }
}
