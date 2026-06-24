import { StyleSheet, Text, View } from 'react-native';
import ProgressRing from '../ui/ProgressRing';
import { colors, typography } from '../../theme';

export default function FriendRingMini({ progress = 0, size = 52, color = colors.primary }) {
  return (
    <View style={styles.wrap}>
      <ProgressRing
        size={size}
        strokeWidth={5}
        progress={progress}
        color={color}
        trackColor={colors.border}
      >
        <Text style={styles.percent}>{progress}%</Text>
      </ProgressRing>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  percent: {
    ...typography.caption,
    color: colors.textPrimary,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
});
