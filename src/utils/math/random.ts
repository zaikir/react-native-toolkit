export function randomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min) + min);
}

export function randomFloat(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.random() * max;
}
