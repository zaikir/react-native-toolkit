export class ControlledPromise<T> {
  promise: Promise<T>;

  // @ts-ignore
  resolve: (value: T | PromiseLike<T>) => void;
  // @ts-ignore
  reject: (reason?: any) => void;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  wait() {
    return this.promise;
  }
}
