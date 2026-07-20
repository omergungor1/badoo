import { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getRandomMascot } from '../../constants/mascots';
import { colors, radius, typography } from '../../theme';

/**
 * Ana sayfa sağ alt — akademi giriş butonu.
 * Bugünkü ders bekliyorsa küçük nokta gösterir.
 */
export default function AcademyMascotFab({ hasPendingLesson }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mascot = useMemo(() => getRandomMascot(), []);

  return (
    <Pressable
      onPress={() => router.push('/academy')}
      style={({ pressed }) => [
        styles.wrap,
        { bottom: Math.max(insets.bottom, 12) + 78 },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel="Dr. Badoo Akademi"
    >
      <View style={styles.bubble}>
        <Image source={mascot} style={styles.mascot} resizeMode="contain" />
        {hasPendingLesson ? <View style={styles.dot} /> : null}
      </View>
      <Text style={styles.label}>Akademi</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 14,
    alignItems: 'center',
    zIndex: 20,
    gap: 4,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.96 }],
  },
  bubble: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  mascot: {
    width: 52,
    height: 52,
  },
  dot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1CB0F6',
    borderWidth: 2,
    borderColor: colors.white,
  },
  label: {
    ...typography.caption,
    fontSize: 10,
    lineHeight: 12,
    color: colors.textPrimary,
    fontFamily: typography.bodySemiBold.fontFamily,
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
});
