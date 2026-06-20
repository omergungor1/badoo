import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { updateProfile } from './profileService';

const BUCKET = 'profile-images';

async function uriToArrayBuffer(uri) {
  const response = await fetch(uri);
  return response.arrayBuffer();
}

function withCacheBust(publicUrl) {
  const separator = publicUrl.includes('?') ? '&' : '?';
  return `${publicUrl}${separator}t=${Date.now()}`;
}

export async function pickProfileImage() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return { uri: null, error: { message: 'Galeri erişim izni gerekli.' } };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });

  if (result.canceled) {
    return { uri: null, error: null };
  }

  return { uri: result.assets[0].uri, error: null };
}

export async function uploadProfileImage(userId, sourceUri) {
  const thumb = await ImageManipulator.manipulateAsync(
    sourceUri,
    [{ resize: { width: 200, height: 200 } }],
    { compress: 0.82, format: ImageManipulator.SaveFormat.JPEG },
  );

  const original = await ImageManipulator.manipulateAsync(
    sourceUri,
    [{ resize: { width: 1200 } }],
    { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
  );

  const thumbPath = `${userId}/thumb.jpg`;
  const originalPath = `${userId}/original.jpg`;

  const thumbBuffer = await uriToArrayBuffer(thumb.uri);
  const originalBuffer = await uriToArrayBuffer(original.uri);

  const { error: thumbError } = await supabase.storage
    .from(BUCKET)
    .upload(thumbPath, thumbBuffer, { upsert: true, contentType: 'image/jpeg' });

  if (thumbError) {
    return { data: null, error: thumbError };
  }

  const { error: originalError } = await supabase.storage
    .from(BUCKET)
    .upload(originalPath, originalBuffer, { upsert: true, contentType: 'image/jpeg' });

  if (originalError) {
    return { data: null, error: originalError };
  }

  const { data: thumbUrlData } = supabase.storage.from(BUCKET).getPublicUrl(thumbPath);
  const { data: originalUrlData } = supabase.storage.from(BUCKET).getPublicUrl(originalPath);

  const profile_image_thumb_url = withCacheBust(thumbUrlData.publicUrl);
  const profile_image_url = withCacheBust(originalUrlData.publicUrl);

  const { data, error } = await updateProfile(userId, {
    profile_image_url,
    profile_image_thumb_url,
  });

  return {
    data,
    previewUri: thumb.uri,
    error,
  };
}

export async function deleteProfileImage(userId) {
  const paths = [`${userId}/thumb.jpg`, `${userId}/original.jpg`];

  await supabase.storage.from(BUCKET).remove(paths);

  const { data, error } = await updateProfile(userId, {
    profile_image_url: null,
    profile_image_thumb_url: null,
  });

  return { data, error };
}
