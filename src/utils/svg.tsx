import { Extrapolation, interpolate } from 'react-native-reanimated';

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
  createRectangularPath(
    k: number,
    rect: { width: number; height: number },
    border: {
      radius: number;
      width: number;
    },
    start: 'left' | 'top' | 'right' | 'bottom',
    clockwise?: boolean,
  ) {
    'worklet';

    const borderWidth = border.width;
    const innerBorderRadius = border.radius;
    const [innerButtonWidth, innerButtonHeigth] = [rect.width, rect.height];
    const [svgButtonWidth, svgButtonHeigth] =
      start === 'bottom' || start === 'top'
        ? [rect.width, rect.height]
        : [rect.height, rect.width];

    const outerButtonWidth = innerButtonWidth + borderWidth * 2;
    const outerButtonHeigth = innerButtonHeigth + borderWidth * 2;

    const outerSvgButtonWidth = svgButtonWidth + borderWidth * 2;
    const outerSvgButtonHeigth = svgButtonHeigth + borderWidth * 2;

    const r = innerBorderRadius;
    const R = r + borderWidth / 2;

    const drawCorner = (angle: number, x1: number, y1: number) => {
      const x = R * Math.sin(angle);
      const y = R * Math.cos(angle);

      return `a${R} ${R}, 0 0, 1, ${x + x1} ${y + y1}`;
    };

    const L0 = 0;
    const L1 = svgButtonWidth / 2 - r;
    const L2 = L1 + r * 2;
    const L3 = L2 + svgButtonHeigth - r * 2;
    const L4 = L3 + r * 2;
    const L5 = L4 + svgButtonWidth - r * 2;
    const L6 = L5 + r * 2;
    const L7 = L6 + svgButtonHeigth - r * 2;
    const L8 = L7 + r * 2;
    const L9 = L8 + svgButtonWidth / 2 - r;
    const l = L9 * k;

    const path = [
      `M${outerSvgButtonWidth / 2} ${outerSvgButtonHeigth - borderWidth / 2}`,
      `h${
        -(svgButtonWidth / 2 - r) *
        interpolate(l, [L0, L1], [0, 1], Extrapolation.CLAMP)
      }`,
      drawCorner(
        interpolate(
          l,
          [L1, L2],
          [(4 * Math.PI) / 2, (3 * Math.PI) / 2],
          Extrapolation.CLAMP,
        ),
        0,
        -R,
      ),
      `v${
        -(svgButtonHeigth - r * 2) *
        interpolate(l, [L2, L3], [0, 1], Extrapolation.CLAMP)
      }`,
      drawCorner(
        interpolate(
          l,
          [L3, L4],
          [(3 * Math.PI) / 2, (2 * Math.PI) / 2],
          Extrapolation.CLAMP,
        ),
        R,
        0,
      ),
      `h${
        (svgButtonWidth - r * 2) *
        interpolate(l, [L4, L5], [0, 1], Extrapolation.CLAMP)
      }`,
      drawCorner(
        interpolate(
          l,
          [L5, L6],
          [(2 * Math.PI) / 2, Math.PI / 2],
          Extrapolation.CLAMP,
        ),
        0,
        R,
      ),
      `v${
        (svgButtonHeigth - r * 2) *
        interpolate(l, [L6, L7], [0, 1], Extrapolation.CLAMP)
      }`,
      drawCorner(
        interpolate(
          l,
          [L7, L8],
          [(1 * Math.PI) / 2, (0 * Math.PI) / 2],
          Extrapolation.CLAMP,
        ),
        -R,
        0,
      ),
      `h${
        -(svgButtonWidth / 2 - r) *
        interpolate(l, [L8, L9], [0, 1], Extrapolation.CLAMP)
      }`,
    ].join(' ');

    return {
      pathProps: {
        d: path,
        strokeWidth: borderWidth,
        strokeDashoffset:
          L9 * (clockwise ?? true ? 1 : -1) * (start === 'left' ? -1 : 1),
        ...(start === 'left'
          ? {
              transform: `rotate(-90, ${outerButtonHeigth}, ${0}) scale(1, -1) translate(0, ${
                -outerButtonWidth + outerButtonHeigth
              })`,
            }
          : start === 'right'
          ? {
              transform: `rotate(-90, ${outerButtonHeigth}, ${0}) translate(0, ${-outerButtonHeigth})`,
            }
          : start === 'top'
          ? {
              transform: `rotate(180, ${outerButtonWidth / 2}, ${
                outerButtonHeigth / 2
              })`,
            }
          : {}),
      },
      path,
      pathLength: L9,
      svgProps: {
        viewBox: `0 0 ${outerButtonWidth} ${outerButtonHeigth}`,
        preserveAspectRatio: 'none',
      },
    };
  },
};
