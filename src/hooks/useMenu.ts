import { useContext } from 'react';

import { MenuContext } from '../components/Menu';

export function useMenu() {
  return useContext(MenuContext);
}
