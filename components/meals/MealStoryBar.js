import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StoryRing from '../stories/StoryRing';
import { colors, spacing, typography } from '../../theme';

const RING_SIZE = 68;
const LABEL_SPACE = 18;

function AddMealStoryButton({ onPress, disabled }) {
  const innerSize = RING_SIZE - 14;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="Öğün fotoğrafı ekle"
      style={({ pressed }) => [
        styles.addWrap,
        pressed && !disabled && styles.addPressed,
        disabled && styles.addDisabled,
      ]}
    >
      <View style={[styles.addOuter, { width: RING_SIZE, height: RING_SIZE, borderRadius: RING_SIZE / 2 }]}>
        <View
          style={[
            styles.addInner,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
            },
          ]}
        >
          <Ionicons name="add" size={30} color={colors.textPrimary} />
        </View>
      </View>
      <View style={styles.labelSpacer} />
    </Pressable>
  );
}

export default function MealStoryBar({
  meals = [],
  onAddMeal,
  onMealPress,
  showAddButton = true,
  uploading = false,
}) {
  if (!showAddButton && !meals.length) {
    return null;
  }

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {showAddButton ? (
          <AddMealStoryButton
            onPress={onAddMeal}
            disabled={uploading}
          />
        ) : null}

        {meals.map((item) => (
          <StoryRing
            key={item.id}
            ringId={item.id}
            imageUrl={item.image_url}
            size={RING_SIZE}
            viewed={false}
            label={item.meal_title || 'Öğün'}
            onPress={() => onMealPress?.(item)}
          />
        ))}
      </ScrollView>

      <Modal visible={uploading} transparent animationType="fade">
        <View style={styles.uploadOverlay}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.uploadText}>Öğün yükleniyor...</Text>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  addWrap: {
    alignItems: 'center',
    maxWidth: 72,
  },
  addPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  addDisabled: {
    opacity: 0.5,
  },
  addOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.textMuted,
    backgroundColor: colors.white,
  },
  addInner: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  labelSpacer: {
    height: LABEL_SPACE,
  },
  uploadOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  uploadText: {
    ...typography.body,
    color: colors.white,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
});
