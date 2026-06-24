import { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import CustomTabBar from '../../components/navigation/CustomTabBar';
import QuickAddSheet from '../../components/navigation/QuickAddSheet';
import StoryShareSuccessOverlay from '../../components/stories/StoryShareSuccessOverlay';
import { subscribeStoryShared } from '../../utils/storyEvents';
import { colors } from '../../theme';

export default function TabsLayout() {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [storySuccessVisible, setStorySuccessVisible] = useState(false);

  useEffect(() => {
    return subscribeStoryShared(() => setStorySuccessVisible(true));
  }, []);

  return (
    <>
      <Tabs
        tabBar={(props) => (
          <CustomTabBar
            {...props}
            onAddPress={() => setShowQuickAdd(true)}
          />
        )}
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Ana Sayfa' }} />
        <Tabs.Screen name="daily" options={{ title: 'Günlük' }} />
        <Tabs.Screen
          name="add"
          options={{ title: '' }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setShowQuickAdd(true);
            },
          }}
        />
        <Tabs.Screen name="sensitivity" options={{ title: 'Besin Hassasiyeti' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
      </Tabs>

      <QuickAddSheet visible={showQuickAdd} onClose={() => setShowQuickAdd(false)} />

      <StoryShareSuccessOverlay
        visible={storySuccessVisible}
        onClose={() => setStorySuccessVisible(false)}
      />
    </>
  );
}
