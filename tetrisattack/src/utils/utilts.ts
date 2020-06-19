export function randomElement<T>(array: T[]) {
  const n = Math.floor(Math.random() * array.length);
  return array[n];
}

export function random(chance: number) {
  return Math.random() * 100 < chance;
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
