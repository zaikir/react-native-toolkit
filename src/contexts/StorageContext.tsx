import React, {
  createContext,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from 'react';

import SyncStorage, { CSyncStorage } from 'utils/SyncStorage';

export type StorageContextType = {
  storage: CSyncStorage;
};

export const StorageContext = createContext<StorageContextType>({} as any);

export function StorageProvider({ children }: PropsWithChildren<object>) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    (async () => {
      await SyncStorage.init();
      setIsInitialized(true);
    })();
  }, []);

  const contextData = useMemo<StorageContextType>(
    () => ({ storage: SyncStorage }),
    [],
  );

  if (!isInitialized) {
    return null;
  }

  return (
    <StorageContext.Provider value={contextData}>
      {children}
    </StorageContext.Provider>
  );
}
