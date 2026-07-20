import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from '../../components/ui/Toast';
import { useAuth } from '../../context/AuthContext';
import { completeTask } from '../../services/logService';
import { analyzeMealText } from '../../services/mealApiService';
import { emitMealShared } from '../../utils/mealEvents';
import { colors, radius, spacing, typography } from '../../theme';

const DOT_COUNT = 5;
const LISTENING_BG = '#F2F2F7';

function loadSpeechRecognition() {
  try {
    // Expo Go'da native modül yok; require sırasında hata fırlatır.
    // eslint-disable-next-line global-require
    return require('expo-speech-recognition');
  } catch {
    return null;
  }
}

const speechRecognition = loadSpeechRecognition();

function ListeningDots({ volume = -2 }) {
  const anims = useRef(Array.from({ length: DOT_COUNT }, () => new Animated.Value(0))).current;

  useEffect(() => {
    const loops = anims.map((anim, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 90),
          Animated.timing(anim, {
            toValue: 1,
            duration: 320,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 320,
            useNativeDriver: true,
          }),
        ]),
      ),
    );

    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [anims]);

  const volumeBoost = Math.max(0, Math.min(1, (volume + 2) / 12));

  return (
    <View style={styles.dotsRow}>
      {anims.map((anim, index) => {
        const mid = index === 2;
        const translateY = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, mid ? -10 - volumeBoost * 8 : -6 - volumeBoost * 4],
        });

        return (
          <View key={`dot-${index}`} style={styles.dotSlot}>
            {mid ? (
              <Animated.View
                style={[
                  styles.peakMark,
                  {
                    opacity: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.35, 1],
                    }),
                    transform: [{ translateY: -18 }],
                  },
                ]}
              />
            ) : null}
            <Animated.View
              style={[
                styles.dot,
                mid && styles.dotCenter,
                { transform: [{ translateY }] },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

function UnavailableScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const hideToast = useCallback(() => setToastMessage(null), []);

  function handleClose() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)');
  }

  async function handleSubmit() {
    if (!text.trim()) {
      Alert.alert('Eksik metin', 'Göndermek için bir metin yazın.');
      return;
    }

    setSubmitting(true);
    const { data, error } = await analyzeMealText(text);
    setSubmitting(false);

    if (error) {
      const message =
        error.code === 'claude_error'
          ? 'Öğün şu anda analiz edilemedi. Lütfen tekrar deneyin.'
          : error.message;
      Alert.alert('Hata', message);
      return;
    }

    if (data?.meal && user?.id) {
      await completeTask(user.id, 'meals');
      emitMealShared(data);
    }

    setToastMessage('Başarılı');
    setTimeout(() => {
      if (router.canGoBack()) {
        router.back();
        return;
      }
      router.replace('/(tabs)');
    }, 900);
  }

  return (
    <KeyboardAvoidingView
      style={[styles.safe, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Toast message={toastMessage} onHide={hideToast} />

      <View style={styles.mockCenter}>
        <Ionicons name="mic-off-outline" size={40} color={colors.textSecondary} />
        <Text style={styles.statusText}>Expo test modu</Text>
        <Text style={styles.unavailableHint}>
          Ses tanıma Expo Go’da çalışmaz. Metin yazıp göndererek akışı test edin.
        </Text>

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Örn: Sabah 2 yumurta ve bir bardak süt içtim"
          placeholderTextColor={colors.textMuted}
          multiline
          textAlignVertical="top"
          style={styles.mockInput}
        />
      </View>

      <View style={styles.controls}>
        <Pressable
          onPress={handleClose}
          style={({ pressed }) => [styles.cancelBtn, pressed && styles.btnPressed]}
          accessibilityLabel="Kapat"
        >
          <Ionicons name="close" size={22} color={colors.white} />
        </Pressable>

        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          style={({ pressed }) => [styles.confirmBtn, pressed && styles.btnPressed]}
          accessibilityLabel="Gönder"
        >
          {submitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Ionicons name="checkmark" size={34} color={colors.white} />
          )}
        </Pressable>

        <View style={styles.controlSpacer} />
      </View>
    </KeyboardAvoidingView>
  );
}

function VoiceNoteListening() {
  const { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } = speechRecognition;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const finalizedRef = useRef('');
  const [previewText, setPreviewText] = useState('');
  const [listening, setListening] = useState(false);
  const [volume, setVolume] = useState(-2);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const hideToast = useCallback(() => setToastMessage(null), []);

  useSpeechRecognitionEvent('start', () => setListening(true));
  useSpeechRecognitionEvent('end', () => setListening(false));
  useSpeechRecognitionEvent('volumechange', (event) => {
    setVolume(typeof event.value === 'number' ? event.value : -2);
  });
  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results?.[0]?.transcript?.trim() || '';
    if (!transcript) return;

    if (event.isFinal) {
      finalizedRef.current = [finalizedRef.current, transcript].filter(Boolean).join(' ').trim();
      setPreviewText(finalizedRef.current);
      return;
    }

    setPreviewText([finalizedRef.current, transcript].filter(Boolean).join(' ').trim());
  });
  useSpeechRecognitionEvent('error', (event) => {
    if (event.error === 'aborted' || event.error === 'no-speech') return;
    Alert.alert('Hata', event.message || 'Ses tanıma başlatılamadı.');
  });

  const startListening = useCallback(async () => {
    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('İzin gerekli', 'Mikrofon ve ses tanıma izni gerekli.');
      return;
    }

    finalizedRef.current = '';
    setPreviewText('');
    setVolume(-2);

    ExpoSpeechRecognitionModule.start({
      lang: 'tr-TR',
      interimResults: true,
      continuous: true,
      volumeChangeEventOptions: {
        enabled: true,
        intervalMillis: 120,
      },
    });
  }, [ExpoSpeechRecognitionModule]);

  useEffect(() => {
    startListening();

    return () => {
      try {
        ExpoSpeechRecognitionModule.abort();
      } catch {
        // ignore
      }
    };
  }, [ExpoSpeechRecognitionModule, startListening]);

  function handleCancel() {
    try {
      ExpoSpeechRecognitionModule.abort();
    } catch {
      // ignore
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)');
  }

  async function handleConfirm() {
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch {
      // ignore
    }

    const text = previewText.trim();
    if (!text) {
      Alert.alert('Eksik metin', 'Analiz edilecek bir konuşma bulunamadı.');
      return;
    }

    setSubmitting(true);
    const { data, error } = await analyzeMealText(text);
    setSubmitting(false);

    if (error) {
      const message =
        error.code === 'claude_error'
          ? 'Öğün şu anda analiz edilemedi. Lütfen tekrar deneyin.'
          : error.message;
      Alert.alert('Hata', message);
      return;
    }

    if (data?.meal && user?.id) {
      await completeTask(user.id, 'meals');
      emitMealShared(data);
    }

    setToastMessage('Başarılı');
    setTimeout(() => {
      if (router.canGoBack()) {
        router.back();
        return;
      }
      router.replace('/(tabs)');
    }, 900);
  }

  const statusLabel = previewText
    ? previewText
    : listening
      ? 'Dinleniyor...'
      : 'Hazırlanıyor...';

  return (
    <View style={[styles.safe, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Toast message={toastMessage} onHide={hideToast} />

      <View style={styles.center}>
        <ListeningDots volume={volume} />
        <Text style={[styles.statusText, previewText ? styles.previewText : null]}>
          {statusLabel}
        </Text>
      </View>

      <View style={styles.controls}>
        <Pressable
          onPress={handleCancel}
          style={({ pressed }) => [styles.cancelBtn, pressed && styles.btnPressed]}
          accessibilityLabel="İptal"
        >
          <Ionicons name="close" size={22} color={colors.white} />
        </Pressable>

        <Pressable
          onPress={handleConfirm}
          disabled={submitting}
          style={({ pressed }) => [styles.confirmBtn, pressed && styles.btnPressed]}
          accessibilityLabel="Onayla"
        >
          {submitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Ionicons name="checkmark" size={34} color={colors.white} />
          )}
        </Pressable>

        <View style={styles.controlSpacer} />
      </View>
    </View>
  );
}

export default function VoiceNoteScreen() {
  if (!speechRecognition?.ExpoSpeechRecognitionModule) {
    return <UnavailableScreen />;
  }

  return <VoiceNoteListening />;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: LISTENING_BG,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 14,
    height: 56,
  },
  dotSlot: {
    width: 18,
    height: 56,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.textPrimary,
  },
  dotCenter: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  peakMark: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: colors.textPrimary,
    transform: [{ rotate: '45deg' }],
  },
  statusText: {
    ...typography.headingMedium,
    fontSize: 22,
    lineHeight: 30,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  previewText: {
    ...typography.body,
    fontSize: 20,
    lineHeight: 28,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  unavailableHint: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  mockCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  mockInput: {
    alignSelf: 'stretch',
    minHeight: 140,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    ...typography.body,
    color: colors.textPrimary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  cancelBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#C7C7CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#8E8E93',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlSpacer: {
    width: 48,
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
});
