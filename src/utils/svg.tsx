export const SvgUtils = {
  sinusoidFunction(
    offsetX: number,
    offsetY: number,
    amplitude: number,
    frequency: number,
  ) {
    'worklet';
    return (x: number) => {
      return amplitude * Math.sin(x / (1 / frequency) + offsetX) + offsetY;
    };
  },
  createGraphPath(
    length: number,
    functions:
      | (
          | ((x: number) => number)
          | {
              function: (x: number) => number;
              operator: '+' | '-' | '*' | '/';
            }
        )[],
    parameters?: {
      offsetY?: number;
      quantization?: number;
    },
  ) {
    'worklet';

    let x = 0;
    let path = `M${x} ${functions.reduce((acc, item) => {
      if (typeof item === 'function') {
        return acc + item(x);
      } else if (item.operator === '+') {
        return acc + item.function(x);
      } else if (item.operator === '-') {
        return acc - item.function(x);
      } else if (item.operator === '*') {
        return acc * item.function(x);
      } else if (item.operator === '/') {
        return acc / item.function(x);
      }

      throw new Error('Not implemented');
    }, parameters?.offsetY ?? 0)}`;

    do {
      const clamped = x > length ? length : x;
      path += `L${clamped} ${functions.reduce((acc, item) => {
        if (typeof item === 'function') {
          return acc + item(clamped);
        } else if (item.operator === '+') {
          return acc + item.function(clamped);
        } else if (item.operator === '-') {
          return acc - item.function(clamped);
        } else if (item.operator === '*') {
          return acc * item.function(clamped);
        } else if (item.operator === '/') {
          return acc / item.function(clamped);
        }

        throw new Error('Not implemented');
      }, parameters?.offsetY ?? 0)}`;

      x += parameters?.quantization ?? 2;
    } while (x <= length);

    return path;
  },
  polarToCartesian(
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number,
  ) {
    'worklet';

    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  },
};
