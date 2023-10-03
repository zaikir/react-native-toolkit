import { wait } from './wait';

export async function waitUntil(
  fn: (() => boolean) | (() => Promise<boolean>),
  timeout?: number,
  retries?: number,
) {
  for (let i = 0; retries == null || i < retries; i++) {
    const result = await fn();
    if (result) {
      return;
    }

    await wait(timeout ?? 1000);
  }

  throw new Error('Max retries attempts reached');
}
