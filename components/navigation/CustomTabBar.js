import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography } from '../../theme';

const TABS = [
  { key: 'index', label: 'Ana Sayfa', icon: '🏠' },
  { key: 'daily', label: 'Günlük', icon: '📖' },
  { key: 'add', label: '', icon: '+' },
  { key: 'stats', label: 'İstatistik', icon: '📊' },
  { key: 'profile', label: 'Profil', icon: '👤' },
];

export default function CustomTabBar({ state, descriptors, navigation, onAddPress }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const tab = TABS[index];

        if (tab.key === 'add') {
          return (
            <View key={route.key} style={styles.fabWrap}>
              <Pressable style={styles.fab} onPress={onAddPress}>
                <View style={styles.plusIcon}>
                  <View style={styles.plusBarH} />
                  <View style={styles.plusBarV} />
                </View>
              </Pressable>
            </View>
          );
        }

        return (
          <Pressable
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={styles.tab}
          >
            <Text style={styles.icon}>{tab.icon}</Text>
            <Text style={[styles.label, isFocused && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    minHeight: 64,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingBottom: 4,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.primary,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  fabWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 4,
    marginTop: -12,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  plusIcon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusBarH: {
    position: 'absolute',
    width: 26,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.white,
  },
  plusBarV: {
    position: 'absolute',
    width: 4,
    height: 26,
    borderRadius: 2,
    backgroundColor: colors.white,
  },
});
