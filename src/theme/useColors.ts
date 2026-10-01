import { useColorScheme } from 'react-native';

import { palette, type Colors, type Scheme } from './tokens';

export function useScheme(): Scheme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? 'dark' : 'light';
}

export function useColors(): Colors {
  return palette[useScheme()];
}
