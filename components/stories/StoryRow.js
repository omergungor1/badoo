import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { spacing, typography, colors } from '../../theme';
import { deleteStory } from '../../services/storyService';
import StoryRing from './StoryRing';
import StoryViewer from './StoryViewer';

export default function StoryRow({
  stories,
  userName,
  isOwner = false,
  onStoriesChange,
  showLabel = false,
  openAtIndex = null,
  onViewerClosed,
}) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [localStories, setLocalStories] = useState(stories);

  const activeStories = onStoriesChange ? stories : localStories;

  useEffect(() => {
    if (openAtIndex != null && openAtIndex >= 0 && activeStories.length) {
      setStartIndex(openAtIndex);
      setViewerOpen(true);
    }
  }, [openAtIndex, activeStories.length]);

  function closeViewer() {
    setViewerOpen(false);
    onViewerClosed?.();
  }

  function updateStories(next) {
    if (onStoriesChange) {
      onStoriesChange(next);
    } else {
      setLocalStories(next);
    }
  }

  const handleDeleteStory = useCallback(async (story) => {
    const { error } = await deleteStory(story.id, story.image_path);
    if (error) {
      Alert.alert('Hata', error.message || 'Story silinemedi.');
      return;
    }

    const next = activeStories.filter((s) => s.id !== story.id);
    updateStories(next);

    if (!next.length) {
      closeViewer();
      return;
    }

    setStartIndex((idx) => Math.min(idx, next.length - 1));
  }, [activeStories, updateStories]);

  if (!activeStories?.length) return null;

  function openStory(index) {
    setStartIndex(index);
    setViewerOpen(true);
  }

  return (
    <>
      <View style={styles.wrap}>
        {showLabel ? <Text style={styles.label}>Story'lerim</Text> : null}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {activeStories.map((story, index) => (
            <StoryRing
              key={story.id}
              ringId={story.id}
              imageUrl={story.image_url}
              size={64}
              onPress={() => openStory(index)}
            />
          ))}
        </ScrollView>
      </View>

      <StoryViewer
        visible={viewerOpen}
        stories={activeStories}
        initialIndex={startIndex}
        userName={userName}
        isOwner={isOwner}
        onDeleteStory={isOwner ? handleDeleteStory : undefined}
        onClose={closeViewer}
      />
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginVertical: spacing.xs,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontFamily: typography.bodySemiBold.fontFamily,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
});
