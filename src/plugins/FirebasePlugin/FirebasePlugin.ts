import analytics from '@react-native-firebase/analytics';
import initializeRemoteConfig, {
  FirebaseRemoteConfigTypes,
} from '@react-native-firebase/remote-config';

import { timeout } from '../../index';
import { Plugin, PluginFeature } from '../Plugin';
import type {
  IAnalyticsProvider,
  IRemoteConfigPlugin,
  RemoteConfig,
} from '../types';

export class FirebasePlugin
  extends Plugin
  implements IRemoteConfigPlugin, IAnalyticsProvider
{
  readonly name = 'FirebasePlugin';
  readonly features: PluginFeature[] = ['RemoteConfig', 'Analytics'];
  readonly initializationTimeout = null;

  _remoteConfig: RemoteConfig;
  _firebaseConfig: FirebaseRemoteConfigTypes.ConfigSettings;

  get remoteValues() {
    return this._remoteConfig;
  }

  constructor(options: {
    remoteConfig?: RemoteConfig;
    firebaseConfig?: FirebaseRemoteConfigTypes.ConfigSettings;
  }) {
    super();
    this._remoteConfig = options.remoteConfig ?? {};
    this._firebaseConfig = options.firebaseConfig ?? {
      minimumFetchIntervalMillis: 0,
      fetchTimeMillis: 5000,
    };
  }

  async initialize() {
    if (this._remoteConfig) {
      const config = initializeRemoteConfig();

      try {
        await timeout(async () => {
          await config.setConfigSettings(this._firebaseConfig);
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

  async logEvent(event: string, parameters?: Record<string, any> | undefined) {
    await analytics().logEvent(event, parameters);
  }
}
