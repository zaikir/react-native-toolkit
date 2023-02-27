import { wait } from './wait';

export async function waitUntil(
  fn: () => Promise<boolean>,
  timeout?: number,
  retries?: number,
) {
  for (let i = 0; i < (retries ?? 10); i++) {
    const result = await fn();
    if (result) {
      return;
    }

    await wait(timeout ?? 1000);
  }

  throw new Error('Max retries attempts reached');
}
