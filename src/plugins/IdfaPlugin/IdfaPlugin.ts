import ReactNativeIdfaAaid from '@sparkfabrik/react-native-idfa-aaid';

import { Plugin, PluginFeature } from 'plugins/Plugin';

export class IdfaPlugin extends Plugin {
  readonly name = IdfaPlugin.name;

  readonly features: PluginFeature[] = ['IDFA'];
  private _idfa: string | null = null;

  public get idfa() {
    return this._idfa;
  }

  async initialize() {
    const res = await ReactNativeIdfaAaid.getAdvertisingInfo();
    if (res.isAdTrackingLimited || !res.id) {
      return;
    }

    this._idfa = res.id!;
  }
}
