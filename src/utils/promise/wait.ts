export function wait(timeout: number) {
  if (!timeout) {
    return;
  }

  return new Promise<void>((resove) => {
    setTimeout(() => resove(), timeout);
  });
}
