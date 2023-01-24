export type PluginFeature =
  | 'ErrorTracking'
  | 'RemoteConfig'
  | 'Analytics'
  | 'InAppPurchase'
  | 'IAPReceiptValidator'
  | 'Network';

export type InitializationError = {
  code?: 'offline';
  error: string;
};

export type InitializationOptions = {
  fallbackScreen?:
    | React.ReactNode
    | ((props: {
        error: InitializationError;
        isRetrying: boolean;
        retry: () => Promise<void>;
      }) => React.ReactNode);
};

export type InitializedPlugin = {
  instance: Plugin;
  data: any;
};

export abstract class Plugin {
  abstract get name(): string;
  abstract get features(): PluginFeature[];

  get fallbackScreen(): InitializationOptions['fallbackScreen'] | null {
    return this.options?.fallbackScreen ?? null;
  }

  constructor(readonly options?: InitializationOptions) {}

  abstract init(
    bundle: InitializedPlugin[],
  ): Promise<InitializedPlugin | InitializationError>;
}
