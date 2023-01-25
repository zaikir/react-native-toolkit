import { useContext } from 'react';

import { ColorSchemeContext } from 'contexts/ColorSchemeContext/ColorSchemeContext';

export function useColorScheme() {
  const { colorScheme, setColorScheme } = useContext(ColorSchemeContext);

  return { colorScheme, setColorScheme };
}
