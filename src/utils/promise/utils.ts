import { all } from './all';
import { timeout } from './timeout';
import { wait } from './wait';
import { waitUntil } from './waitUntil';

export class PromiseUtils {
  static timeout = timeout;
  static wait = wait;
  static waitUntil = waitUntil;
  static all = all;
}
