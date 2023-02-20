import { retry as promiseRetry, RetryConfig } from 'ts-retry-promise';

export function retry<T>(
  f: () => Promise<T>,
  config?: Partial<RetryConfig<unknown>>,
) {
  return promiseRetry(f, config);
}
