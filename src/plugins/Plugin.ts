export interface Plugin {
  readonly name: string;
  init: () => Promise<any>
}
