import { Plugin, PluginFeature } from 'plugins/Plugin';

export class NetworkPlugin extends Plugin {
  readonly name = 'NetworkPlugin';

  readonly features: PluginFeature[] = ['Network'];

  constructor(
    readonly options?: {
      offlineMode?: boolean;
    },
  ) {
    super();
  }

  async initialize() {
    if (
      !(this.options?.offlineMode ?? true) &&
      !(await this.isInternetReachable())
    ) {
      throw new Error('No internet connection');
    }
  }

  async isInternetReachable() {
    try {
      await fetch('https://google.com');
      return true;
    } catch {
      return false;
    }
  }
}
