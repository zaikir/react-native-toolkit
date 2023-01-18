import React, { createContext, PropsWithChildren, useMemo } from 'react';
import type { Theme } from 'theme';

export type ThemeContextType = {
  theme: Theme,
};

export const ThemeContext = createContext<ThemeContextType>({} as any);

export function ThemeProvider({
  children,
  theme,
}: PropsWithChildren<{ theme: Theme }>) {
  const contextData = useMemo<ThemeContextType>(
    () => ({ theme }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={contextData}>
      {children}
    </ThemeContext.Provider>
  );
}
