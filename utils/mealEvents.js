const listeners = new Set();

export function subscribeMealShared(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitMealShared(payload) {
  listeners.forEach((listener) => listener(payload));
}
