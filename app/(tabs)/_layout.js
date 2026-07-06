import { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import CustomTabBar from '../../components/navigation/CustomTabBar';
import QuickAddSheet from '../../components/navigation/QuickAddSheet';
import MealShareSuccessOverlay from '../../components/meals/MealShareSuccessOverlay';
import { subscribeMealShared } from '../../utils/mealEvents';
import { colors } from '../../theme';

export default function TabsLayout() {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [mealSuccessVisible, setMealSuccessVisible] = useState(false);

  useEffect(() => {
    return subscribeMealShared(() => setMealSuccessVisible(true));
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
        <Tabs.Screen name="analysis" options={{ title: 'Analiz' }} />
        <Tabs.Screen name="daily" options={{ href: null }} />
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
        <Tabs.Screen name="social" options={{ title: 'Social' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
      </Tabs>

      <QuickAddSheet visible={showQuickAdd} onClose={() => setShowQuickAdd(false)} />

      <MealShareSuccessOverlay
        visible={mealSuccessVisible}
        onClose={() => setMealSuccessVisible(false)}
      />
    </>
  );
}
