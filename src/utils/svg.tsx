export class SvgUtils {
  static sinusoidFunction(
    offsetX: number,
    offsetY: number,
    amplitude: number,
    frequency: number,
  ) {
    'worklet';
    return (x: number) => {
      return amplitude * Math.sin(x / (1 / frequency) + offsetX) + offsetY;
    };
  }

  static createGraphPath(
    length: number,
    functions: ((x: number) => number)[],
    parameters?: {
      offsetY?: number;
      quantization?: number;
    },
  ) {
    'worklet';

    let x = 0;
    let path = `M${x} ${functions.reduce(
      (acc, item) => acc + item(x),
      parameters?.offsetY ?? 0,
    )}`;

    do {
      const clamped = x > length ? length : x;
      path += `L${clamped} ${functions.reduce(
        (acc, item) => acc + item(clamped),
        parameters?.offsetY ?? 0,
      )}`;

      x += parameters?.quantization ?? 2;
    } while (x <= length);

    return path;
  }
}
