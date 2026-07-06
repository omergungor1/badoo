export function formatStoryTime(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);

  if (minutes < 10) return 'Az önce';

  if (hours < 1) {
    const rounded = Math.max(1, Math.round(minutes / 5) * 5);
    return `${rounded}dk`;
  }

  return `${hours}s`;
}
