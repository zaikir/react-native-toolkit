import {
  Dispatch, SetStateAction, useCallback, useContext, useState,
} from 'react';
import { StorageContext } from 'contexts/StorageContext/StorageContext';

export function useStorage() {
  const { storage } = useContext(StorageContext);

  return storage;
}

export function useStoredState<T>(key: string, initialState?: T): [T, Dispatch<SetStateAction<T>>] {
  const storage = useStorage();
  const [value, setValue] = useState<T>(storage.getItem(key) ?? initialState);

  const setter = useCallback((newValue: T | ((prevState: T) => T)) => {
    if (typeof newValue === 'function') {
      // @ts-ignore
      const resultValue = newValue(value);
      setValue(resultValue);
      storage.setItem(key, resultValue);
      return;
    }

    setValue(newValue);
    storage.setItem(key, newValue);
  }, [key, value, setValue, storage]);

  return [value, setter];
}