export type GenericFunction = (...args: any[]) => any;

export type FunctionWrapper<F extends GenericFunction> = (
  ...args: Parameters<F>
) => Promise<ReturnType<F>>;
