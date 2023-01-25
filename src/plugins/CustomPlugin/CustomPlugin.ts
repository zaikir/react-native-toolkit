import {
  InitializationError,
  InitializationOptions,
  InitializedPlugin,
  Plugin,
  PluginFeature,
} from 'plugins/Plugin';

export class CustomPlugin extends Plugin {
  readonly name = CustomPlugin.name;

  readonly features: PluginFeature[] = [];

  constructor(
    readonly options: InitializationOptions & {
      init: (
        bundle: InitializedPlugin[],
        index: number,
      ) => Promise<Omit<InitializedPlugin, 'instance'> | InitializationError>;
      name?: string;
      features?: PluginFeature[];
    },
  ) {
    super(options);
    this.name = options.name ?? CustomPlugin.name;
    this.features = options.features ?? [];
  }

  async init(
    bundle: InitializedPlugin[],
    index: number,
  ): Promise<InitializedPlugin | InitializationError> {
    const data = await this.options.init(bundle, index);
    if ('error' in data) {
      return data;
    }

    return {
      ...data,
      instance: this,
    };
  }
}
