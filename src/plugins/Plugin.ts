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

export interface Plugin {
  readonly name: string;
  readonly features: PluginFeature[];

  init: (
    bundle: InitializedPlugin[],
  ) => Promise<InitializedPlugin | InitializationError>;
}
