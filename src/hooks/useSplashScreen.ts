import { useContext } from 'react';

import { SplashScreenContext } from '../components/AppSplashScreen';

export function useSplashScreen() {
  const { hide } = useContext(SplashScreenContext);

  return { hide };
}
