import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CHECKIN_SYMPTOMS,
  SEVERITY_OPTIONS,
  pickFollowUpSymptom,
} from '../../constants/digestionCheckin';
import { getRandomMascot } from '../../constants/mascots';
import { colors, radius, spacing, typography } from '../../theme';

export default function DigestionCheckinModal({
  visible,
  timeOfDay,
  saving,
  onDismiss,
  onSave,
}) {
  const insets = useSafeAreaInsets();
  const mascot = useMemo(() => getRandomMascot(), []);
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState({});
  const [followUpAnswer, setFollowUpAnswer] = useState(null);

  useEffect(() => {
    if (!visible) {
      setStep(1);
      setSelected({});
      setFollowUpAnswer(null);
    }
  }, [visible]);

  const selectedList = useMemo(
    () =>
      Object.entries(selected).map(([name, severity]) => ({
        name,
        severity,
      })),
    [selected],
  );

  const followUp = useMemo(() => pickFollowUpSymptom(selectedList), [selectedList]);

  function toggleSymptom(key) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = 2;
      return next;
    });
  }

  function setSeverity(key, severity) {
    setSelected((prev) => ({ ...prev, [key]: severity }));
  }

  function handleFeelingOk() {
    onSave?.({
      feelingOk: true,
      timeOfDay,
      symptoms: [],
      followUp: null,
    });
  }

  function handlePrimarySave() {
    if (followUp) {
      setStep(2);
      setFollowUpAnswer(null);
      return;
    }
    onSave?.({
      feelingOk: selectedList.length === 0,
      timeOfDay,
      symptoms: selectedList,
      followUp: null,
    });
  }

  function finishWithFollowUp(answer) {
    onSave?.({
      feelingOk: false,
      timeOfDay,
      symptoms: selectedList,
      followUp: followUp
        ? {
          symptom: followUp.symptom,
          question: followUp.question,
          answer: answer || null,
        }
        : null,
    });
  }

  const selectedKeys = useMemo(() => Object.keys(selected), [selected]);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.handleRow}>
            <View style={styles.handle} />
            <Pressable onPress={onDismiss} hitSlop={12} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          {step === 1 ? (
            <ScrollView
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.hero}>
                <Image source={mascot} style={styles.mascot} resizeMode="contain" />
                <View style={styles.heroCopy}>
                  <Text style={styles.eyebrow}>Dr. Badoo Check-in</Text>
                  <Text style={styles.title}>Şu an nasıl hissediyorsun?</Text>
                  <Text style={styles.sub}>
                    {timeOfDay === 'morning' ? 'Sabah kontrolü' : 'Öğleden sonra kontrolü'} · günde
                    en fazla 2 kez
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={handleFeelingOk}
                disabled={saving}
                style={({ pressed }) => [styles.okBtn, pressed && styles.okBtnPressed]}
              >
                <Text style={styles.okBtnText}>İyiyim</Text>
              </Pressable>

              <Text style={styles.orLabel}>ya da belirti seç</Text>

              <View style={styles.chipGrid}>
                {CHECKIN_SYMPTOMS.map((item) => {
                  const isOn = Boolean(selected[item.key]);
                  return (
                    <Pressable
                      key={item.key}
                      onPress={() => toggleSymptom(item.key)}
                      style={[styles.chip, isOn && styles.chipOn]}
                    >
                      <Text style={[styles.chipText, isOn && styles.chipTextOn]} numberOfLines={1}>
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {selectedKeys.length ? (
                <View style={styles.severityPanel}>
                  <Text style={styles.severityTitle}>Şiddet</Text>
                  {selectedKeys.map((key) => {
                    const meta = CHECKIN_SYMPTOMS.find((s) => s.key === key);
                    return (
                      <View key={key} style={styles.severityItem}>
                        <Text style={styles.severityLabel} numberOfLines={1}>
                          {meta?.label || key}
                        </Text>
                        <View style={styles.severityRow}>
                          {SEVERITY_OPTIONS.map((opt) => {
                            const active = selected[key] === opt.value;
                            return (
                              <Pressable
                                key={opt.value}
                                onPress={() => setSeverity(key, opt.value)}
                                style={[styles.sevBtn, active && styles.sevBtnOn]}
                              >
                                <Text style={[styles.sevText, active && styles.sevTextOn]}>
                                  {opt.label}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : null}

              <Pressable
                onPress={handlePrimarySave}
                disabled={saving}
                style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.9 }]}
              >
                <Text style={styles.saveBtnText}>{saving ? 'Kaydediliyor…' : 'Kaydet'}</Text>
              </Pressable>
            </ScrollView>
          ) : (
            <View style={styles.followContent}>
              <Text style={styles.eyebrow}>Bir soru daha</Text>
              <Text style={styles.title}>{followUp?.question}</Text>
              <Text style={styles.sub}>
                {CHECKIN_SYMPTOMS.find((s) => s.key === followUp?.symptom)?.label || 'Belirti'}
              </Text>

              <View style={styles.followOptions}>
                {(followUp?.options || []).map((opt) => (
                  <Pressable
                    key={opt.value}
                    onPress={() => finishWithFollowUp(opt.value)}
                    disabled={saving}
                    style={({ pressed }) => [
                      styles.followBtn,
                      followUpAnswer === opt.value && styles.followBtnOn,
                      pressed && { opacity: 0.9 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.followBtnText,
                        followUpAnswer === opt.value && styles.followBtnTextOn,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Pressable onPress={() => finishWithFollowUp(null)} disabled={saving}>
                <Text style={styles.skip}>Atla</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '92%',
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.sm,
  },
  handleRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    minHeight: 28,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  closeBtn: {
    position: 'absolute',
    right: spacing.lg,
    top: 0,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mascot: { width: 56, height: 56 },
  heroCopy: { flex: 1, gap: 2 },
  eyebrow: {
    ...typography.caption,
    color: colors.digestion,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  title: {
    ...typography.bodySemiBold,
    fontSize: 20,
    lineHeight: 26,
    color: colors.textPrimary,
  },
  sub: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  okBtn: {
    backgroundColor: colors.activity,
    borderRadius: radius.lg,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#16A34A',
  },
  okBtnPressed: {
    borderBottomWidth: 2,
    transform: [{ translateY: 2 }],
  },
  okBtnText: {
    ...typography.bodySemiBold,
    fontSize: 17,
    color: colors.white,
  },
  orLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipOn: {
    backgroundColor: '#FFF4E8',
    borderColor: colors.digestion,
  },
  chipText: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 13,
  },
  chipTextOn: { color: '#C2410C' },
  severityPanel: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  severityTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  severityItem: {
    gap: 6,
  },
  severityLabel: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  severityRow: {
    flexDirection: 'row',
    gap: 6,
  },
  sevBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 8,
  },
  sevBtnOn: {
    backgroundColor: colors.digestion,
    borderColor: colors.digestion,
  },
  sevText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  sevTextOn: { color: colors.white },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    ...typography.bodySemiBold,
    color: colors.white,
  },
  followContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  followOptions: { gap: spacing.sm, marginTop: spacing.sm },
  followBtn: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followBtnOn: {
    backgroundColor: colors.digestion,
    borderColor: colors.digestion,
  },
  followBtnText: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  },
  followBtnTextOn: { color: colors.white },
  skip: {
    ...typography.bodySemiBold,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});
