// Story özelliği kaldırıldı. Geriye dönük importlar için boş sonuç döner.

export async function getActiveStoriesForUsers() {
  return { data: [], error: null };
}

export async function getActiveStories() {
  return { data: [], error: null };
}

export async function deleteStory() {
  return { error: null };
}

export async function uploadStory() {
  return { data: null, error: { message: 'Story özelliği kaldırıldı.' } };
}

export async function pickStoryPhoto() {
  return { uri: null, error: { message: 'Story özelliği kaldırıldı.' } };
}

export async function captureAndShareStory() {
  return { data: null, error: { message: 'Story özelliği kaldırıldı.' } };
}
