import AsyncStorage from '@react-native-async-storage/async-storage';

type OnEndCallback = (err?: string) => void;
type KeyValuePair = [string, any];

const wrapPromise = (promise: Promise<void>, onEnd?: OnEndCallback) => {
  if (!onEnd) {
    return;
  }

  promise.then(() => onEnd()).catch((err) => onEnd((err as Error).message));
};

export class CSyncStorage {
  keys: string[] = [];

  data: Record<string, any> = {};

  async init() {
    this.keys = (await AsyncStorage.getAllKeys()) as string[];
    const stored = await AsyncStorage.multiGet(this.keys);

    stored.forEach(([key, item]) => {
      let value = item;

      if (item) {
        try {
          value = JSON.parse(item);
        } catch {
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

    wrapPromise(AsyncStorage.setItem(key, JSON.stringify(value)), onEnd);
  }

  removeItem(key: string, onEnd?: OnEndCallback) {
    delete this.data[key];

    wrapPromise(AsyncStorage.removeItem(key), onEnd);
  }

  getAllKeys() {
    return this.keys;
  }

  clear(onEnd?: OnEndCallback) {
    this.data = {};

    wrapPromise(AsyncStorage.clear(), onEnd);
  }
}

const SyncStorage = new CSyncStorage();

export default SyncStorage;
