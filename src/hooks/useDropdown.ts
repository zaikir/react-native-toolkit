import { useContext } from 'react';

import { DropDownContext } from '../contexts/DropDownContext';

export function useDropdown() {
  return useContext(DropDownContext);
}
