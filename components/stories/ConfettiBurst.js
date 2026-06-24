import { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { IG_GRADIENT_COLORS } from '../../constants/stories';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PARTICLE_COUNT = 48;
const DURATION_MS = 2800;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function createParticles() {
  const colors = [...IG_GRADIENT_COLORS, '#FFD700', '#FF6B6B', '#4ECDC4', '#fff'];
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: randomBetween(0, SCREEN_WIDTH),
    color: colors[Math.floor(Math.random() * colors.length)],
    size: randomBetween(6, 12),
    delay: randomBetween(0, 400),
    drift: randomBetween(-80, 80),
    rotation: randomBetween(0, 360),
  }));
}

function Particle({ particle }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: DURATION_MS + particle.delay,
      delay: particle.delay,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [particle.delay, progress]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, SCREEN_HEIGHT + 40],
  });

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, particle.drift],
  });

  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [`${particle.rotation}deg`, `${particle.rotation + 720}deg`],
  });

  const opacity = progress.interpolate({
    inputRange: [0, 0.1, 0.85, 1],
    outputRange: [0, 1, 1, 0],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.particle,
        {
          left: particle.x,
          width: particle.size,
          height: particle.size * 0.6,
          backgroundColor: particle.color,
          opacity,
          transform: [{ translateY }, { translateX }, { rotate }],
        },
      ]}
    />
  );
}

export default function ConfettiBurst({ active }) {
  const particles = useMemo(() => (active ? createParticles() : []), [active]);

  if (!active || !particles.length) return null;

  return (
    <View style={styles.wrap} pointerEvents="none">
      {particles.map((p) => (
        <Particle key={p.id} particle={p} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },
  particle: {
    position: 'absolute',
    top: 0,
    borderRadius: 2,
  },
});
