import { useCallback } from 'react';
import {
  check,
  Permission,
  request,
  openSettings,
} from 'react-native-permissions';

export function usePermissions() {
  const isPermissionGranted = useCallback(async (permission: Permission) => {
    const status = await check(permission);
    if (status === 'unavailable' || status === 'blocked') {
      return false;
    }

    if (status === 'granted' || status === 'limited') {
      return true;
    }

    const newStatus = await request(permission);
    if (newStatus === 'granted' || newStatus === 'limited') {
      return true;
    }

    return false;
  }, []);

  return {
    isPermissionGranted,
    openSettings,
  };
}
