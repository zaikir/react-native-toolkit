import * as Branch from 'react-native-branch';

import { Plugin, PluginFeature } from '../Plugin';
import type { IAnalyticsProvider } from '../types';

export class BranchPlugin extends Plugin implements IAnalyticsProvider {
  readonly name = 'BranchPlugin';
  readonly features: PluginFeature[] = ['Analytics'];
  readonly initializationTimeout = 5000;

  get instance() {
    return Branch;
  }

  async initialize() {}

  async logEvent(event: string, parameters?: Record<string, any> | undefined) {
    await new Branch.BranchEvent(event, undefined, parameters).logEvent();
  }
}
