import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { FRIEND_NOTE_DURATIONS } from '../../constants/friends';
import { getNoteTimeLeft } from '../../services/friendNoteService';
import Chip from '../ui/Chip';
import { colors, radius, spacing, typography } from '../../theme';

export default function EphemeralNoteBubble({
  note,
  showReply = false,
  onReply,
  replying = false,
}) {
  const [replyText, setReplyText] = useState('');
  const [expanded, setExpanded] = useState(false);

  async function handleReply() {
    if (!replyText.trim() || !onReply) return;
    await onReply(replyText.trim());
    setReplyText('');
    setExpanded(false);
  }

  return (
    <View style={styles.bubble}>
      <View style={styles.tag}>
        <Text style={styles.tagText}>✨ Süreli not</Text>
        <Text style={styles.timeLeft}>{getNoteTimeLeft(note.expires_at)}</Text>
      </View>
      <Text style={styles.message}>{note.message}</Text>

      {showReply ? (
        <View style={styles.replyArea}>
          {!expanded ? (
            <Pressable onPress={() => setExpanded(true)}>
              <Text style={styles.replyBtn}>Cevapla</Text>
            </Pressable>
          ) : (
            <View style={styles.replyForm}>
              <TextInput
                value={replyText}
                onChangeText={setReplyText}
                placeholder="Kısa bir cevap yaz..."
                placeholderTextColor={colors.textSecondary}
                style={styles.replyInput}
                multiline
              />
              <Pressable onPress={handleReply} disabled={replying}>
                <Text style={styles.sendBtn}>{replying ? 'Gönderiliyor...' : 'Gönder'}</Text>
              </Pressable>
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}

export function NoteComposer({ durationHours, onDurationChange, message, onMessageChange }) {
  return (
    <View style={styles.composer}>
      <Text style={styles.composerLabel}>Ne kadar süre görünsün?</Text>
      <View style={styles.durationRow}>
        {FRIEND_NOTE_DURATIONS.map((item) => (
          <Chip
            key={item.hours}
            label={item.label}
            selected={durationHours === item.hours}
            onPress={() => onDurationChange(item.hours)}
          />
        ))}
      </View>
      <TextInput
        value={message}
        onChangeText={onMessageChange}
        placeholder="Motivasyon notu yaz..."
        placeholderTextColor={colors.textSecondary}
        style={styles.composerInput}
        multiline
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    backgroundColor: '#FFF7ED',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#FFE4C7',
    gap: spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagText: {
    ...typography.caption,
    color: colors.primary,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  timeLeft: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  message: {
    ...typography.body,
    color: colors.textPrimary,
  },
  replyArea: {
    marginTop: spacing.xs,
  },
  replyBtn: {
    ...typography.bodySmall,
    color: colors.primary,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  replyForm: {
    gap: spacing.sm,
  },
  replyInput: {
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  sendBtn: {
    ...typography.bodySmall,
    color: colors.primary,
    fontFamily: typography.bodySemiBold.fontFamily,
    alignSelf: 'flex-end',
  },
  composer: {
    gap: spacing.sm,
  },
  composerLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  durationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  composerInput: {
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    minHeight: 96,
    textAlignVertical: 'top',
  },
});
