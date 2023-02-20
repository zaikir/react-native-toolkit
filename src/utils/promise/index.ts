import { retry } from './retry';
import { timeout } from './timeout';
import { wait } from './wait';

export class PromiseUtils {
  static timeout = timeout;
  static wait = wait;
  static retry = retry;
}
