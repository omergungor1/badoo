import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { STORY_VIEW_DURATION_MS } from '../../constants/stories';
import { typography } from '../../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_CLOSE_THRESHOLD = 120;

function formatStoryTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Az önce';
  if (hours < 24) return `${hours}s`;
  return '1g';
}

export default function StoryViewer({
  visible,
  stories,
  initialIndex = 0,
  userName,
  isOwner = false,
  onDeleteStory,
  onClose,
}) {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const progressAnims = useRef([]);
  const animRef = useRef(null);
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const story = stories[currentIndex];
  const total = stories.length;

  const stopProgress = useCallback(() => {
    if (animRef.current) {
      animRef.current.stop();
      animRef.current = null;
    }
  }, []);

  const goNext = useCallback(() => {
    stopProgress();
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      onClose();
    }
  }, [currentIndex, total, onClose, stopProgress]);

  const goPrev = useCallback(() => {
    stopProgress();
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex, stopProgress]);

  const startProgress = useCallback(() => {
    stopProgress();

    progressAnims.current.forEach((anim, i) => {
      if (!anim) return;
      anim.stopAnimation();
      anim.setValue(i < currentIndex ? 1 : i === currentIndex ? 0 : 0);
    });

    const currentAnim = progressAnims.current[currentIndex];
    if (!currentAnim) return;

    animRef.current = Animated.timing(currentAnim, {
      toValue: 1,
      duration: STORY_VIEW_DURATION_MS,
      useNativeDriver: false,
    });

    animRef.current.start(({ finished }) => {
      if (finished) goNext();
    });
  }, [currentIndex, goNext, stopProgress]);

  useEffect(() => {
    if (!visible) return;
    progressAnims.current = stories.map((_, i) => progressAnims.current[i] || new Animated.Value(0));
    setCurrentIndex(initialIndex);
    translateY.setValue(0);
    opacity.setValue(1);
  }, [visible, initialIndex, stories, translateY, opacity]);

  useEffect(() => {
    if (!visible || !story) return;
    startProgress();
    return stopProgress;
  }, [visible, currentIndex, story, startProgress, stopProgress]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 8 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) {
          translateY.setValue(g.dy);
          opacity.setValue(Math.max(0.3, 1 - g.dy / SCREEN_HEIGHT));
        }
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > SWIPE_CLOSE_THRESHOLD) {
          stopProgress();
          onClose();
        } else {
          Animated.parallel([
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
            Animated.spring(opacity, { toValue: 1, useNativeDriver: true }),
          ]).start();
        }
      },
    }),
  ).current;

  function confirmDelete() {
    if (!isOwner || !onDeleteStory || !story) return;

    stopProgress();
    Alert.alert(
      'Story\'yi sil',
      'Bu story\'yi kaldırmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel', onPress: startProgress },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => onDeleteStory(story),
        },
      ],
    );
  }

  if (!visible || !story) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent onRequestClose={onClose}>
      <Animated.View
        style={[styles.container, { opacity, transform: [{ translateY }] }]}
        {...panResponder.panHandlers}
      >
        <Image
          source={{ uri: story.image_url }}
          style={styles.image}
          contentFit="cover"
          transition={150}
        />

        <View style={styles.tapZones} pointerEvents="box-none">
          <Pressable style={styles.tapLeft} onPress={goPrev} />
          <Pressable style={styles.tapRight} onPress={goNext} />
        </View>

        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <View style={styles.progressRow}>
            {stories.map((s, i) => (
              <View key={s.id} style={styles.progressTrack}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnims.current[i]?.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
            ))}
          </View>

          <View style={styles.headerRow}>
            <Text style={styles.userName}>{userName || 'Story'}</Text>
            <Text style={styles.time}>{formatStoryTime(story.created_at)}</Text>
            <View style={styles.headerSpacer} />
            {isOwner ? (
              <Pressable onPress={confirmDelete} hitSlop={12} style={styles.closeBtn}>
                <Ionicons name="trash-outline" size={24} color="#fff" />
              </Pressable>
            ) : null}
            <Pressable onPress={() => { stopProgress(); onClose(); }} hitSlop={12} style={styles.closeBtn}>
              <Ionicons name="close" size={28} color="#fff" />
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  tapZones: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 5,
  },
  tapLeft: {
    flex: 1,
  },
  tapRight: {
    flex: 2,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    zIndex: 10,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  progressTrack: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    ...typography.bodySemiBold,
    color: '#fff',
    fontSize: 14,
  },
  time: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
  },
  headerSpacer: {
    flex: 1,
  },
  closeBtn: {
    padding: 4,
  },
});
