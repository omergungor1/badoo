import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, typography } from '../../theme';

const TAB_CONFIG = {
  index: {
    label: 'Ana Sayfa',
    icon: 'home',
    iconOutline: 'home-outline',
  },
  analysis: {
    label: 'Analiz',
    icon: 'bar-chart',
    iconOutline: 'bar-chart-outline',
  },
  social: {
    label: 'Sosyal',
    icon: 'people',
    iconOutline: 'people-outline',
  },
  profile: {
    label: 'Profil',
    icon: 'person',
    iconOutline: 'person-outline',
  },
};

const LEFT_TABS = ['index', 'analysis'];
const RIGHT_TABS = ['social', 'profile'];

export default function CustomTabBar({ state, navigation, onAddPress }) {
  const insets = useSafeAreaInsets();

  function renderTab(routeName) {
    const tab = TAB_CONFIG[routeName];
    if (!tab) return null;

    const routeIndex = state.routes.findIndex((route) => route.name === routeName);
    const isFocused = state.index === routeIndex;
    const route = state.routes[routeIndex];

    if (!route) return null;

    return (
      <Pressable
        key={route.key}
        onPress={() => navigation.navigate(route.name)}
        style={styles.tab}
      >
        <View style={[styles.tabInner, isFocused && styles.tabInnerActive]}>
          <Ionicons
            name={isFocused ? tab.icon : tab.iconOutline}
            size={22}
            color={isFocused ? colors.textPrimary : colors.textSecondary}
          />
          <Text style={[styles.label, isFocused && styles.labelActive]} numberOfLines={1}>
            {tab.label}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={[styles.outer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.pill}>
        <View style={styles.sideGroup}>
          {LEFT_TABS.map(renderTab)}
        </View>

        <Pressable
          onPress={onAddPress}
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
          accessibilityLabel="Hızlı ekle"
          accessibilityRole="button"
        >
          <Ionicons name="add" size={30} color={colors.white} />
        </Pressable>

        <View style={styles.sideGroup}>
          {RIGHT_TABS.map(renderTab)}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 6,
    minHeight: 68,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  sideGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radius.full,
    minWidth: 56,
  },
  tabInnerActive: {
    backgroundColor: '#EFEFEF',
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    lineHeight: 12,
  },
  labelActive: {
    color: colors.textPrimary,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  fab: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.fab,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.97 }],
  },
});
