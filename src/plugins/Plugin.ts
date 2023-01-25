export type PluginFeature =
  | 'ErrorTracking'
  | 'RemoteConfig'
  | 'Analytics'
  | 'InAppPurchase'
  | 'IAPReceiptValidator'
  | 'Network';

export type PluginFactoryOptions = {
  name?: string;
  optional?: boolean;
  fallbackScreen?:
    | React.ReactNode
    | ((props: {
        error: string;
        isRetrying: boolean;
        retry: () => Promise<void>;
      }) => React.ReactNode);
};

export abstract class Plugin {
  abstract get name(): string;
  abstract get features(): PluginFeature[];

  payload?: any;

  abstract initialize(): Promise<void>;
}

export class PluginsBundle {
  constructor(readonly plugins: Plugin[]) {}

  get<T extends Plugin>(constructorOrName: (new (...args: any) => T) | string) {
    if (typeof constructorOrName === 'string') {
      return this.plugins.find((x) => x.name === constructorOrName) as
        | T
        | undefined;
    }

    return this.plugins.find((x) => x.name === constructorOrName.name) as
      | T
      | undefined;
  }

  getByFeature<T extends Plugin>(feature: PluginFeature) {
    return this.plugins.find((x) => x.features.includes(feature)) as
      | T
      | undefined;
  }
}
