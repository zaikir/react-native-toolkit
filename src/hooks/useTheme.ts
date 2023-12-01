import { useContext } from 'react';

import { ThemeContext, UseTheme } from '../contexts/ThemeContext';
import type { Theme } from '../index';

export function useTheme(): UseTheme<Theme> {
  const { theme } = useContext(ThemeContext);

  return theme;
}
