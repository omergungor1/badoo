import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { IG_GRADIENT_COLORS } from '../../constants/stories';
import { colors } from '../../theme';

const AVATAR_SIZE = 86;
const RING_WIDTH = 2.5;
const GAP = 2;

export default function ProfileAvatar({ thumbUri, uploading, onPress, onLongPress, storyRingActive = false }) {
  const innerSize = AVATAR_SIZE - (storyRingActive ? (RING_WIDTH + GAP) * 2 : 4);
  const gradId = 'profileAvatarStoryRing';

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={uploading}
      style={styles.avatarPress}
    >
      <View style={[styles.avatarRing, !storyRingActive && styles.avatarRingDefault]}>
        {storyRingActive ? (
          <Svg width={AVATAR_SIZE} height={AVATAR_SIZE} style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                {IG_GRADIENT_COLORS.map((color, i) => (
                  <Stop
                    key={color}
                    offset={`${(i / (IG_GRADIENT_COLORS.length - 1)) * 100}%`}
                    stopColor={color}
                  />
                ))}
              </LinearGradient>
            </Defs>
            <Circle
              cx={AVATAR_SIZE / 2}
              cy={AVATAR_SIZE / 2}
              r={AVATAR_SIZE / 2 - RING_WIDTH / 2}
              stroke={`url(#${gradId})`}
              strokeWidth={RING_WIDTH}
              fill="none"
            />
          </Svg>
        ) : null}

        <View
          style={[
            styles.avatarInner,
            storyRingActive
              ? {
                  width: innerSize,
                  height: innerSize,
                  borderRadius: innerSize / 2,
                  margin: RING_WIDTH + GAP,
                }
              : null,
          ]}
        >
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
  },
  avatarRingDefault: {
    padding: 2,
    backgroundColor: colors.border,
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
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
