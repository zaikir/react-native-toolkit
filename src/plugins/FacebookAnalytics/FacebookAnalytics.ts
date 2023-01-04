import type { InitializedPlugin, Plugin, PluginFeature } from 'plugins/Plugin';
import remoteConfig from '@react-native-firebase/remote-config';
import type { RemoteConfig } from 'plugins/types';

export class FacebookAnalytics implements Plugin {
  readonly name = FacebookAnalytics.name;

  readonly features: PluginFeature[] = ['Analytics'];

  constructor(
    readonly parameters: RemoteConfig,
  ) {}

  async init(): Promise<InitializedPlugin | string> {
    try {
      const config = remoteConfig();

      await config.setConfigSettings({ minimumFetchIntervalMillis: 0 });
      await config.setDefaults({ ...this.parameters });

      await config.fetch(0);
      await config.activate();

      return {
        instance: this,
        data: {
          parameters: Object.fromEntries(
            Object.entries(this.parameters).map(([key, defaultValue]) => {
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
