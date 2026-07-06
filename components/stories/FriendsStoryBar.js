import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getActiveStoriesForUsers } from '../../services/storyService';
import { getDisplayName } from '../../utils/friendRings';
import { loadViewedStoryIds, markStoriesViewed, sortStoriesForFeed } from '../../utils/storyViews';
import { spacing } from '../../theme';
import StoryRing from './StoryRing';
import StoryViewer from './StoryViewer';

function groupStoriesByUser(stories) {
  return stories.reduce((acc, story) => {
    if (!acc[story.user_id]) acc[story.user_id] = [];
    acc[story.user_id].push(story);
    return acc;
  }, {});
}

export default function FriendsStoryBar({ friends = [] }) {
  const [stories, setStories] = useState([]);
  const [viewedIds, setViewedIds] = useState(new Set());
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerStories, setViewerStories] = useState([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerMeta, setViewerMeta] = useState({ userName: '', userAvatarUrl: null });

  const profileByUserId = useMemo(() => {
    return friends.reduce((acc, friend) => {
      acc[friend.friendId] = friend.profile;
      return acc;
    }, {});
  }, [friends]);

  const loadStories = useCallback(async () => {
    const friendIds = friends.map((f) => f.friendId).filter(Boolean);
    if (!friendIds.length) {
      setStories([]);
      return;
    }

    const [viewed, { data }] = await Promise.all([
      loadViewedStoryIds(),
      getActiveStoriesForUsers(friendIds),
    ]);

    setViewedIds(viewed);
    setStories(data || []);
  }, [friends]);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  useFocusEffect(
    useCallback(() => {
      loadStories();
    }, [loadStories]),
  );

  const sortedStories = useMemo(
    () => sortStoriesForFeed(stories, viewedIds),
    [stories, viewedIds],
  );

  const storiesByUser = useMemo(() => groupStoriesByUser(stories), [stories]);

  function openStory(story) {
    const userStories = storiesByUser[story.user_id] || [story];
    const index = userStories.findIndex((s) => s.id === story.id);
    const profile = profileByUserId[story.user_id];

    setViewerStories(userStories);
    setViewerIndex(index >= 0 ? index : 0);
    setViewerMeta({
      userName: getDisplayName(profile),
      userAvatarUrl: profile?.profile_image_thumb_url || null,
    });
    setViewerOpen(true);
  }

  async function handleStoryViewed(storyId) {
    if (!storyId || viewedIds.has(storyId)) return;

    const next = await markStoriesViewed([storyId]);
    setViewedIds(new Set(next));
  }

  async function handleViewerClose() {
    setViewerOpen(false);
  }

  if (!sortedStories.length) return null;

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {sortedStories.map((story) => {
          const profile = profileByUserId[story.user_id];
          return (
            <StoryRing
              key={story.id}
              ringId={story.id}
              imageUrl={story.image_url}
              size={68}
              viewed={viewedIds.has(story.id)}
              label={getDisplayName(profile)}
              onPress={() => openStory(story)}
            />
          );
        })}
      </ScrollView>

      <StoryViewer
        key={viewerStories[0]?.user_id || 'story-viewer'}
        visible={viewerOpen}
        stories={viewerStories}
        initialIndex={viewerIndex}
        userName={viewerMeta.userName}
        userAvatarUrl={viewerMeta.userAvatarUrl}
        onStoryViewed={handleStoryViewed}
        onClose={handleViewerClose}
      />
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
});
