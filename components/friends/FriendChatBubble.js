import { StyleSheet, Text, View } from 'react-native';
import { formatTime } from '../../utils/date';
import { colors, radius, spacing, typography } from '../../theme';

export default function FriendChatBubble({ message, isMine, timestamp }) {
  return (
    <View style={[styles.row, isMine ? styles.rowMine : styles.rowTheirs]}>
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
        <Text style={[styles.text, isMine && styles.textMine]}>{message}</Text>
        <Text style={[styles.time, isMine && styles.timeMine]}>{formatTime(timestamp)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  rowMine: {
    justifyContent: 'flex-end',
  },
  rowTheirs: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: 4,
  },
  bubbleMine: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: radius.sm,
  },
  bubbleTheirs: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: radius.sm,
  },
  text: {
    ...typography.body,
    color: colors.textPrimary,
  },
  textMine: {
    color: colors.white,
  },
  time: {
    ...typography.caption,
    color: colors.textSecondary,
    alignSelf: 'flex-end',
  },
  timeMine: {
    color: 'rgba(255,255,255,0.75)',
  },
});
