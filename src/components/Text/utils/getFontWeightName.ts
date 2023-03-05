import type { TextStyle } from 'react-native';

export function getFontWeightName(fontWeight: TextStyle['fontWeight']) {
  switch (fontWeight) {
    case '100':
      return ['hairline', 'thin'];
    case '200':
      return ['extralight', 'ultralight'];
    case '300':
      return ['light'];
    case '400':
    case 'normal':
      return ['normal', 'regular'];
    case '500':
      return ['medium'];
    case '600':
      return ['semibold', 'demibold'];
    case '700':
    case 'bold':
      return ['bold'];
    case '800':
      return ['extrabold', 'ultrabold'];
    case '900':
      return ['black', 'heavy'];
    default:
      throw new Error(`Unknown font weight: ${fontWeight}`);
  }
}
