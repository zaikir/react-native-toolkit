import type { InitializedPlugin, Plugin, PluginFeature } from 'plugins/Plugin';

export class FirebaseRemoteConfig implements Plugin {
  readonly name = FirebaseRemoteConfig.name;

  readonly features: PluginFeature[] = ['RemoteConfig'];

  // eslint-disable-next-line class-methods-use-this
  init(): Promise<InitializedPlugin | string> {
    return Promise.resolve('Not implemented');
  }
}
