import { useCallback } from 'react';
import {
  checkMultiple,
  requestMultiple,
  Permission,
  openSettings,
} from 'react-native-permissions';

export function usePermissions() {
  const checkPermissionStatus = useCallback(
    async (permission: Permission | Permission[], request = true) => {
      const permissions =
        typeof permission === 'string' ? [permission] : permission;

      const statusesMap = await checkMultiple(permissions);
      const statuses = Object.entries(statusesMap).map((x) => ({
        permission: x[0] as Permission,
        status: x[1],
      }));

      const grantedPermissions = statuses.filter(
        (x) => x.status === 'granted' || x.status === 'limited',
      );

      if (grantedPermissions.length === permissions.length) {
        return { status: 'granted' };
      }

      const blockedPermissions = statuses.filter(
        (x) => x.status === 'blocked' || x.status === 'unavailable',
      );

      if (blockedPermissions.length) {
        return {
          status: 'blocked',
          permissions: blockedPermissions.map((x) => x.permission),
        };
      }

      const deniedPermissions = statuses.filter((x) => x.status === 'denied');

      if (!request) {
        return {
          status: 'blocked',
          permissions: deniedPermissions.map((x) => x.permission),
        };
      }

      const newStatusesMap = await requestMultiple(
        deniedPermissions.map((x) => x.permission),
      );

      const newStatuses = Object.entries(newStatusesMap).map((x) => ({
        permission: x[0] as Permission,
        status: x[1],
      }));

      const newGrantedPermissions = newStatuses.filter(
        (x) => x.status === 'granted' || x.status === 'limited',
      );

      // ToDo: await limited image picker here

      if (newGrantedPermissions.length === deniedPermissions.length) {
        return { status: 'granted' };
      }

      const newBlockedPermissions = newStatuses.filter(
        (x) => x.status === 'blocked' || x.status === 'unavailable',
      );

      return {
        status: 'blocked',
        permissions: newBlockedPermissions.map((x) => x.permission),
      };
    },
    [],
  );

  return {
    checkPermissionStatus,
    openSettings,
  };
}
