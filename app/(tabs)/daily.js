import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme';

export default function DailyScreen() {
  return <SafeAreaView style={styles.safe} edges={['top']} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
});
