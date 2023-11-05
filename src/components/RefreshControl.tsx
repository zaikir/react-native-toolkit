import React, { useState } from 'react';
import {
  RefreshControl as RefreshControlBase,
  RefreshControlProps as RefreshControlPropsBase,
} from 'react-native';

export type RefreshControlProps = Omit<
  RefreshControlPropsBase,
  'onRefresh' | 'refreshing'
> & {
  onRefresh: () => Promise<void>;
};

export function RefreshControl({ onRefresh, ...props }: RefreshControlProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  return (
    <RefreshControlBase
      {...props}
      refreshing={isRefreshing}
      onRefresh={async () => {
        try {
          setIsRefreshing(true);

          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      }}
      tintColor={props.tintColor ?? '#cccccc'}
    />
  );
}
