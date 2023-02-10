export function wait(timeout: number) {
  return new Promise<void>((resove) => {
    setTimeout(() => resove(), timeout);
  });
}
