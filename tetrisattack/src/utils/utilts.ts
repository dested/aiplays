import seedrandom from 'seedrandom';

let rng = seedrandom();

export function seed(initialSeed: string) {
  rng = seedrandom(initialSeed);
}
export function randomElement<T>(array: T[]) {
  const n = Math.floor(rng.quick() * array.length);
  return array[n];
}

export function safeKeys<T>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}
export function groupBy<T, TKey>(items: T[], predicate: (pred: T) => TKey): {items: T[]; key: TKey}[] {
  const groups: {items: T[]; key: TKey}[] = [];
  for (const item of items) {
    const key = predicate(item);
    let group = groups.find((a) => a.key === key);
    if (!group) {
      groups.push((group = {key, items: []}));
    }
    group.items.push(item);
  }
  return groups;
}
export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
}

export function unique<T>(arr: T[]): T[] {
  function onlyUnique(value: T, index: number, self: T[]) {
    return self.indexOf(value) === index;
  }
  return arr.filter(onlyUnique);
}
