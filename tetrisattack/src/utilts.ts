export function randomElement<T>(array: T[]) {
  const n = Math.floor(Math.random() * array.length);
  return array[n];
}

export function random(chance: number) {
  return Math.random() * 100 < chance;
}
