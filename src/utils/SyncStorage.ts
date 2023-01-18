// eslint-disable-next-line consistent-default-export-name/default-export-match-filename
import AsyncStorage from '@react-native-async-storage/async-storage';

type OnEndCallback = (err?: string) => void;
type KeyValuePair = [string, any];

export class CSyncStorage {
  keys: string[] = [];

  data: Record<string, any> = {};

  async init() {
    this.keys = await AsyncStorage.getAllKeys() as string[];
    const stored = await AsyncStorage.multiGet(this.keys);

    stored.forEach(([key, item]) => {
      let value = item;

      if (item) {
        try {
          value = JSON.parse(item);
        } catch (e) {
          // no-op
        }
      }

      this.data[key] = value;
    });
  }

  getItem(key: string) {
    return this.data[key];
  }

  multiGet(keys: string[]): KeyValuePair[] {
    return keys.map((key) => [key, this.data[key]]);
  }

  setItem(key: string, value: any, onEnd?: OnEndCallback) {
    this.data[key] = value;

    this.#wrapPromise(AsyncStorage.setItem(key, JSON.stringify(value)), onEnd);
  }

  removeItem(key: string, onEnd?: OnEndCallback) {
    delete this.data[key];

    this.#wrapPromise(AsyncStorage.removeItem(key), onEnd);
  }

  getAllKeys() {
    return this.keys;
  }

  clear(onEnd?: OnEndCallback) {
    this.data = {};

    this.#wrapPromise(AsyncStorage.clear(), onEnd);
  }

  // eslint-disable-next-line class-methods-use-this
  #wrapPromise(promise: Promise<void>, onEnd?: OnEndCallback) {
    if (!onEnd) {
      return;
    }

    promise
      .then(() => onEnd())
      .catch((err) => onEnd((err as Error).message));
  }
}

const SyncStorage = new CSyncStorage();

export default SyncStorage;
