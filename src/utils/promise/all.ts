import PQueue from 'p-queue';

export function all<T extends readonly (() => unknown)[] | []>(
  promises: T,
  concurrency = 10,
) {
  if (promises.length <= concurrency) {
    return Promise.all(promises.map((x) => x()));
  }

  const queue = new PQueue({ concurrency });
  return queue.addAll(promises);
}
