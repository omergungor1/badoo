import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { IG_GRADIENT_COLORS } from '../../constants/stories';

const RING_WIDTH = 2.5;
const GAP = 2;

export default function StoryRing({ imageUrl, size = 64, onPress, ringId = '0' }) {
  const innerSize = size - (RING_WIDTH + GAP) * 2;
  const radius = size / 2 - RING_WIDTH / 2;
  const gradId = `storyRingGrad-${ringId}`;

  return (
    <Pressable onPress={onPress} style={{ width: size, height: size }}>
      <View style={{ width: size, height: size }}>
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  inner: {
    position: 'absolute',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
