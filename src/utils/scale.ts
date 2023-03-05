import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const [shortDimension, longDimension] =
  width < height ? [width, height] : [height, width];

export class ScaleReference {
  static width = 375;

  static height = 812;
}

export const scaleX = (size: number) =>
  (shortDimension / ScaleReference.width) * size;
export const scaleY = (size: number) =>
  (longDimension / ScaleReference.height) * size;
