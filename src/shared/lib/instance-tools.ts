export function cloneInstance<T extends object>(entity: T, newProps: Partial<T>): T {
  const clone = Object.create(Object.getPrototypeOf(entity));
  return Object.assign(clone, entity, newProps);
}

export function createInstance<T extends object>(constructor: new () => T, data: Partial<T>): T {
  return Object.assign(new constructor(), data);
}
