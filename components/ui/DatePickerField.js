import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDate, toISODate } from '../../utils/date';
import { colors, radius, spacing, typography } from '../../theme';

export default function DatePickerField({
  label,
  value,
  onChange,
  minimumDate,
  maximumDate = new Date(),
}) {
  const [show, setShow] = useState(Platform.OS === 'ios');
  const selectedDate = value ? new Date(`${value}T12:00:00`) : new Date();

  function handleChange(event, date) {
    if (Platform.OS === 'android') {
      setShow(false);
    }
    if (event.type === 'dismissed') return;
    if (date) {
      onChange(toISODate(date));
    }
  }

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        onPress={() => setShow(true)}
        style={({ pressed }) => [styles.field, pressed && styles.fieldPressed]}
      >
        <Text style={styles.value}>{value ? formatDate(value) : 'Tarih seçin'}</Text>
      </Pressable>

      {show ? (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={handleChange}
          locale="tr-TR"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  field: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    gap: 4,
  },
  fieldPressed: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  value: {
    ...typography.body,
    color: colors.textPrimary,
    fontFamily: typography.bodyBold.fontFamily,
  },
});
