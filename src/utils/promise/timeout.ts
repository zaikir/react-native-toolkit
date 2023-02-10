export function timeout<T>(promise: T, timeout: number | null = 5000) {
  return Promise.race<T>([
    promise,
    new Promise((_, reject) => {
      if (timeout !== null) {
        setTimeout(() => reject(new Error('Timeout error')), timeout);
      }
    }),
  ]);
}
