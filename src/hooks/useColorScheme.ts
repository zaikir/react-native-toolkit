import { ColorSchemeContext } from 'contexts/ColorSchemeContext/ColorSchemeContext';
import { useContext } from 'react';

export function useColorScheme() {
  const { colorScheme, setColorScheme } = useContext(ColorSchemeContext);

  return { colorScheme, setColorScheme };
}
