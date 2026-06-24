const listeners = new Set();

export function subscribeStoryShared(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function emitStoryShared(story) {
  listeners.forEach((cb) => {
    try {
      cb(story);
    } catch (_) {
      /* ignore */
    }
  });
}
