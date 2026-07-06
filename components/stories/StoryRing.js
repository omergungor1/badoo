import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { IG_GRADIENT_COLORS } from '../../constants/stories';
import { colors } from '../../theme';

const RING_WIDTH = 2.5;
const GAP = 2;
const VIEWED_RING_COLOR = '#c7c7cc';

export default function StoryRing({
  imageUrl,
  size = 64,
  onPress,
  ringId = '0',
  viewed = false,
  label,
}) {
  const innerSize = size - (RING_WIDTH + GAP) * 2;
  const radius = size / 2 - RING_WIDTH / 2;
  const gradId = `storyRingGrad-${ringId}`;

  return (
    <Pressable onPress={onPress} style={styles.wrap}>
      <View style={{ width: size, height: size }}>
        {viewed ? (
          <View
            style={[
              styles.viewedRing,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: RING_WIDTH,
              },
            ]}
          />
        ) : (
          <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
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
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={`url(#${gradId})`}
              strokeWidth={RING_WIDTH}
              fill="none"
            />
          </Svg>
        )}

        <View
          style={[
            styles.inner,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
              top: RING_WIDTH + GAP,
              left: RING_WIDTH + GAP,
            },
          ]}
        >
          <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" />
        </View>
      </View>
      {label ? (
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    maxWidth: 72,
  },
  viewedRing: {
    position: 'absolute',
    borderColor: VIEWED_RING_COLOR,
  },
  inner: {
    position: 'absolute',
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  label: {
    marginTop: 4,
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 72,
  },
});
