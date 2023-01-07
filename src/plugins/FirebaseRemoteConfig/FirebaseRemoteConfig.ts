import type { InitializedPlugin, Plugin, PluginFeature } from 'plugins/Plugin';
import remoteConfig from '@react-native-firebase/remote-config';
import type { RemoteConfig } from 'plugins/types';

export class FirebaseRemoteConfig implements Plugin {
  readonly name = FirebaseRemoteConfig.name;

  readonly features: PluginFeature[] = ['RemoteConfig'];

  constructor(
    readonly defaultParameters: RemoteConfig,
  ) {}

  async init(): Promise<InitializedPlugin | string> {
    try {
      const config = remoteConfig();

      await config.setConfigSettings({ minimumFetchIntervalMillis: 0 });
      await config.setDefaults({ ...this.defaultParameters });

      await config.fetch(0);
      await config.activate();

      return {
        instance: this,
        data: {
          parameters: Object.fromEntries(
            Object.entries(this.defaultParameters).map(([key, defaultValue]) => {
              if (typeof defaultValue === 'string') {
                return [key, config.getString(key)];
              }

              if (typeof defaultValue === 'boolean') {
                return [key, config.getBoolean(key)];
              }

              if (typeof defaultValue === 'number') {
                return [key, config.getNumber(key)];
              }

              return [key, JSON.parse(
                // @ts-ignore
                // eslint-disable-next-line no-underscore-dangle
                config.getValue(key)._value,
              )];
            }),
          ),
        },
      };
    } catch (err) {
      return (err as Error).message;
    }
  }
}
