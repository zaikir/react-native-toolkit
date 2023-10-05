import { useContext } from 'react';

import { ColorSchemeContext } from 'contexts/ColorSchemeContext';

export function useColorScheme() {
  return useContext(ColorSchemeContext);
}
