export function all<T extends readonly unknown[] | []>(
  promises: T,
  // concurrency = 10,
) {
  return Promise.all(promises);
}
