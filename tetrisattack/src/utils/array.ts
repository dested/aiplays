interface Array<T> {
  remove(t: T): T;
}

Array.prototype.remove = function <T>(this: T[], t: T): T | undefined {
  const index = this.indexOf(t);
  if (index >= 0) {
    const item = this[index];
    this.splice(index, 1);
    return item;
  }
  return undefined;
};
