import { ThemeContext } from 'contexts/ThemeContext/ThemeContext';
import { useContext } from 'react';

export function useTheme() {
  const { theme } = useContext(ThemeContext);

  return theme;
}
