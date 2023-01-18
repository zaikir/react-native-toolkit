import { ThemeContext, UseTheme } from 'contexts/ThemeContext/ThemeContext';
import type { Theme } from 'index';
import { useContext } from 'react';

export function useTheme(): UseTheme<Theme> {
  const { theme } = useContext(ThemeContext);

  return theme;
}
