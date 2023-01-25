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
      ) => Promise<InitializedPlugin | InitializationError>;
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
    return this.options.init(bundle, index);
  }
}
