import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { colors, radius, spacing, typography } from '../../theme';

export default function SwipeToDeleteRow({ children, onDelete, enabled = true }) {
  function renderRightActions() {
    return (
      <View style={styles.actions}>
        <Pressable
          style={styles.deleteAction}
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel="Sil"
        >
          <Text style={styles.deleteText}>Sil</Text>
        </Pressable>
      </View>
    );
  }

  if (!enabled) {
    return children;
  }

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
      rightThreshold={40}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginLeft: spacing.sm,
  },
  deleteAction: {
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    minWidth: 72,
  },
  deleteText: {
    ...typography.bodySemiBold,
    color: colors.white,
  },
});
