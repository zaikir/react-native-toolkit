import {
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { StorageContext } from 'contexts/StorageContext';

export function useStorage() {
  const { storage } = useContext(StorageContext);

  return storage;
}

const listeners = new Map<string, Set<Dispatch<SetStateAction<any>>>>();

export function useStoredState<T>(
  key: string,
  initialState?: T,
): [T, Dispatch<SetStateAction<T>>] {
  const storage = useStorage();
  const [value, setValue] = useState<T>(storage.getItem(key) ?? initialState);

  const setter = useCallback(
    (newValue: T | ((prevState: T) => T)) => {
      if (typeof newValue === 'function') {
        // @ts-ignore
        const resultValue = newValue(value);
        setValue(resultValue);
        storage.setItem(key, resultValue);
        return;
      }

      storage.setItem(key, newValue);

      listeners.get(key)?.forEach((listener) => {
        listener(newValue);
      });
    },
    [key, value, setValue, storage],
  );

  useEffect(() => {
    if (!listeners.has(key)) {
      listeners.set(key, new Set<Dispatch<SetStateAction<any>>>());
    }

    listeners.get(key)?.add(setValue);

    return () => {
      listeners.get(key)?.delete(setValue);
    };
  }, []);

  return [value, setter];
}
