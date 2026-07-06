import * as SecureStore from 'expo-secure-store';

const KEY = 'story_viewed_ids';
let cache = null;

export async function loadViewedStoryIds() {
  if (cache) return new Set(cache);

  try {
    const raw = await SecureStore.getItemAsync(KEY);
    cache = raw ? JSON.parse(raw) : [];
  } catch {
    cache = [];
  }

  return new Set(cache);
}

export async function markStoriesViewed(storyIds) {
  if (!storyIds?.length) return loadViewedStoryIds();

  const set = await loadViewedStoryIds();
  storyIds.forEach((id) => set.add(id));
  cache = [...set];

  try {
    await SecureStore.setItemAsync(KEY, JSON.stringify(cache));
  } catch {
    /* ignore */
  }

  return set;
}

export function sortStoriesForFeed(stories, viewedSet) {
  const unviewed = [];
  const viewed = [];

  stories.forEach((story) => {
    if (viewedSet.has(story.id)) {
      viewed.push(story);
    } else {
      unviewed.push(story);
    }
  });

  const byNewest = (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

  return [...unviewed.sort(byNewest), ...viewed.sort(byNewest)];
}
