export type PluginFeature =
  | 'ErrorTracking'
  | 'RemoteConfig'
  | 'Analytics'
  | 'InAppPurchase'
  | 'IAPReceiptValidator'
  | 'Network'
  | 'IDFA';

export type FallbackScreenProps = {
  error: string;
  isRetrying: boolean;
  retry: () => Promise<void>;
};

export type PluginFactoryOptions = {
  name?: string;
  optional?: boolean;
  fallbackScreen?: React.FC<FallbackScreenProps>;
  timeout?: number | null;
};

export abstract class Plugin {
  abstract get name(): string;
  abstract get features(): PluginFeature[];
  abstract get initializationTimeout(): number | null;

  payload?: any;

  abstract initialize(plugins: PluginsBundle): Promise<void> | void;
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

  getByFeature<T>(feature: PluginFeature) {
    return this.plugins.find((x) => x.features.includes(feature)) as
      | T
      | undefined;
  }
}
