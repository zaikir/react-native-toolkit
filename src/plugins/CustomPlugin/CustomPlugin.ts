import { Plugin, PluginFeature } from 'plugins/Plugin';

export class CustomPlugin extends Plugin {
  readonly name = CustomPlugin.name;

  readonly features: PluginFeature[] = [];

  constructor(
    readonly options: {
      // initialize: (bundle: InitializedPlugin[], index: number) => Promise<any>;
      // name?: string;
      // features?: PluginFeature[];
    },
  ) {
    super();
    // this.name = options.name ?? CustomPlugin.name;
    // this.features = options.features ?? [];
  }

  async initialize() {
    // const data = await this.options.initialize(bundle, index);
    // if (data && 'error' in data) {
    //   return data;
    // }
    // return {
    //   ...data,
    //   instance: this,
    //   data: data || {},
    // };
  }
}
