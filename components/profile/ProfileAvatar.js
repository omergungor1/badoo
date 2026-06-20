import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { colors, spacing } from '../../theme';

const AVATAR_SIZE = 86;

export default function ProfileAvatar({ thumbUri, uploading, onPress }) {
  return (
    <Pressable onPress={onPress} disabled={uploading} style={styles.avatarPress}>
      <View style={styles.avatarRing}>
        {thumbUri ? (
          <Image source={{ uri: thumbUri }} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>👤</Text>
          </View>
        )}

        {uploading ? (
          <View style={styles.uploadOverlay}>
            <ActivityIndicator color={colors.white} />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatarPress: {
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarRing: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    padding: 2,
    backgroundColor: colors.border,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.primaryLight,
  },
  placeholder: {
    width: '100%',
    height: '100%',
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 32,
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
