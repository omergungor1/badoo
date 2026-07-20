import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import * as MediaLibrary from 'expo-media-library';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { completeTask } from '../../services/logService';
import { analyzeMealImage } from '../../services/mealApiService';
import { emitMealShared } from '../../utils/mealEvents';
import { colors, spacing, typography } from '../../theme';

const RECENT_LIMIT = 40;
const THUMB_SIZE = 72;

export default function MealPhotoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const cameraRef = useRef(null);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [libraryPermission, requestLibraryPermission] = MediaLibrary.usePermissions();
  const [recentPhotos, setRecentPhotos] = useState([]);
  const [cameraReady, setCameraReady] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadRecentPhotos = useCallback(async () => {
    if (!libraryPermission?.granted) return;

    const page = await MediaLibrary.getAssetsAsync({
      first: RECENT_LIMIT,
      mediaType: MediaLibrary.MediaType.photo,
      sortBy: [[MediaLibrary.SortBy.creationTime, false]],
    });

    setRecentPhotos(page.assets || []);
  }, [libraryPermission?.granted]);

  useEffect(() => {
    if (!cameraPermission?.granted) {
      requestCameraPermission();
    }
  }, [cameraPermission?.granted, requestCameraPermission]);

  useEffect(() => {
    if (!libraryPermission) return;

    if (!libraryPermission.granted) {
      requestLibraryPermission().then((result) => {
        if (result.granted) loadRecentPhotos();
      });
      return;
    }

    loadRecentPhotos();
  }, [libraryPermission, requestLibraryPermission, loadRecentPhotos]);

  function handleClose() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)');
  }

  async function submitPhoto(uri) {
    if (!user?.id || !uri || uploading) return;

    setUploading(true);
    const { data, error } = await analyzeMealImage(uri);

    if (error) {
      setUploading(false);
      const message =
        error.code === 'claude_error'
          ? 'Öğün şu anda analiz edilemedi. Lütfen tekrar deneyin.'
          : error.message || 'Öğün fotoğrafı analiz edilemedi.';
      Alert.alert('Hata', message);
      return;
    }

    if (data?.meal) {
      await completeTask(user.id, 'meals');
      emitMealShared(data);
    }

    handleClose();
  }

  async function handleCapture() {
    if (!cameraRef.current || !cameraReady || uploading) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        skipProcessing: false,
      });

      if (photo?.uri) {
        await submitPhoto(photo.uri);
      }
    } catch (error) {
      Alert.alert('Hata', error?.message || 'Fotoğraf çekilemedi.');
    }
  }

  async function handleSelectAsset(asset) {
    if (!asset || uploading) return;

    try {
      const info = await MediaLibrary.getAssetInfoAsync(asset.id, {
        shouldDownloadFromNetwork: true,
      });
      const uri = info.localUri || info.uri || asset.uri;
      if (!uri) {
        Alert.alert('Hata', 'Fotoğraf alınamadı.');
        return;
      }
      await submitPhoto(uri);
    } catch (error) {
      Alert.alert('Hata', error?.message || 'Fotoğraf seçilemedi.');
    }
  }

  if (!cameraPermission) {
    return <View style={styles.safe} />;
  }

  if (!cameraPermission.granted) {
    return (
      <View style={[styles.safe, styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.permissionText}>Kamera erişimi gerekli.</Text>
        <Pressable onPress={requestCameraPermission} style={styles.permissionBtn}>
          <Text style={styles.permissionBtnText}>İzin Ver</Text>
        </Pressable>
        <Pressable onPress={handleClose} style={styles.closeFallback}>
          <Text style={styles.closeFallbackText}>Kapat</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        mode="picture"
        onCameraReady={() => setCameraReady(true)}
      />

      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          onPress={handleClose}
          hitSlop={12}
          style={styles.iconBtn}
          disabled={uploading}
        >
          <Ionicons name="close" size={28} color={colors.white} />
        </Pressable>
      </View>

      <View style={[styles.bottomPanel, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        {recentPhotos.length > 0 ? (
          <FlatList
            data={recentPhotos}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.libraryList}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleSelectAsset(item)}
                disabled={uploading}
                style={({ pressed }) => [styles.thumbWrap, pressed && styles.thumbPressed]}
              >
                <Image source={{ uri: item.uri }} style={styles.thumb} contentFit="cover" />
              </Pressable>
            )}
          />
        ) : (
          <View style={styles.libraryEmpty}>
            <Text style={styles.libraryEmptyText}>
              {libraryPermission?.granted
                ? 'Son fotoğraflar yükleniyor…'
                : 'Galeriden seçmek için fotoğraf izni verin'}
            </Text>
            {!libraryPermission?.granted ? (
              <Pressable onPress={requestLibraryPermission} hitSlop={8}>
                <Text style={styles.libraryPermitLink}>İzin Ver</Text>
              </Pressable>
            ) : null}
          </View>
        )}

        <View style={styles.captureRow}>
          <Pressable
            onPress={handleCapture}
            disabled={!cameraReady || uploading}
            style={({ pressed }) => [
              styles.captureOuter,
              pressed && styles.capturePressed,
              (!cameraReady || uploading) && styles.captureDisabled,
            ]}
          >
            <View style={styles.captureInner} />
          </Pressable>
        </View>
      </View>

      {uploading ? (
        <View style={styles.uploadOverlay}>
          <ActivityIndicator color={colors.white} size="large" />
          <Text style={styles.uploadText}>Öğün analiz ediliyor…</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  permissionText: {
    ...typography.body,
    color: colors.white,
    textAlign: 'center',
  },
  permissionBtn: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },
  permissionBtnText: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  },
  closeFallback: {
    padding: spacing.sm,
  },
  closeFallbackText: {
    ...typography.body,
    color: colors.textMuted,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    zIndex: 2,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  bottomPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    gap: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingTop: spacing.md,
    zIndex: 2,
  },
  libraryList: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  libraryEmpty: {
    minHeight: THUMB_SIZE,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    gap: spacing.xs,
  },
  libraryEmptyText: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.75)',
  },
  libraryPermitLink: {
    ...typography.bodySemiBold,
    color: colors.white,
  },
  thumbWrap: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  thumbPressed: {
    opacity: 0.75,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  captureRow: {
    alignItems: 'center',
    paddingBottom: spacing.sm,
  },
  captureOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.white,
  },
  capturePressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  captureDisabled: {
    opacity: 0.45,
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    zIndex: 5,
  },
  uploadText: {
    ...typography.bodySemiBold,
    color: colors.white,
  },
});
