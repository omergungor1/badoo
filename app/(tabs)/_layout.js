import { useState } from 'react';
import { Tabs } from 'expo-router';
import CustomTabBar from '../../components/navigation/CustomTabBar';
import QuickAddSheet from '../../components/navigation/QuickAddSheet';
import { colors } from '../../theme';

export default function TabsLayout() {
  const [showQuickAdd, setShowQuickAdd] = useState(false);

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
    </>
  );
}
