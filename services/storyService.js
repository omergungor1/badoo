import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { getDb } from '../lib/db';
import { logSupabaseError } from '../lib/networkLog';
import { STORY_BUCKET, STORY_EXPIRY_HOURS } from '../constants/stories';

async function uriToArrayBuffer(uri) {
  const response = await fetch(uri);
  return response.arrayBuffer();
}

function getExpiresAt() {
  const expires = new Date();
  expires.setHours(expires.getHours() + STORY_EXPIRY_HOURS);
  return expires.toISOString();
}

export async function getActiveStories(userId) {
  const now = new Date().toISOString();

  const { data, error } = await getDb()
    .from('stories')
    .select('id, user_id, image_url, image_path, created_at, expires_at')
    .eq('user_id', userId)
    .gt('expires_at', now)
    .order('created_at', { ascending: true });

  if (error) {
    logSupabaseError('getActiveStories', error, { userId });
  }

  return { data: data || [], error };
}

export async function deleteStory(storyId, imagePath) {
  const { error: dbError } = await getDb()
    .from('stories')
    .delete()
    .eq('id', storyId);

  if (dbError) {
    logSupabaseError('deleteStory db', dbError, { storyId });
    return { error: dbError };
  }

  if (imagePath) {
    const { error: storageError } = await supabase.storage.from(STORY_BUCKET).remove([imagePath]);
    if (storageError) {
      logSupabaseError('deleteStory storage', storageError, { storyId, imagePath });
    }
  }

  return { error: null };
}

export async function uploadStory(userId, sourceUri) {
  const fileKey = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  const compressed = await ImageManipulator.manipulateAsync(
    sourceUri,
    [{ resize: { width: 1080 } }],
    { compress: 0.82, format: ImageManipulator.SaveFormat.JPEG },
  );

  const imagePath = `${userId}/${fileKey}.jpg`;
  const buffer = await uriToArrayBuffer(compressed.uri);

  const { error: uploadError } = await supabase.storage
    .from(STORY_BUCKET)
    .upload(imagePath, buffer, { contentType: 'image/jpeg' });

  if (uploadError) {
    logSupabaseError('uploadStory storage', uploadError, { userId, fileKey });
    return { data: null, error: uploadError };
  }

  const { data: urlData } = supabase.storage.from(STORY_BUCKET).getPublicUrl(imagePath);
  const image_url = urlData.publicUrl;
  const expires_at = getExpiresAt();

  const { data, error } = await getDb()
    .from('stories')
    .insert({
      user_id: userId,
      image_url,
      image_path: imagePath,
      expires_at,
    })
    .select('id, user_id, image_url, created_at, expires_at')
    .single();

  if (error) {
    logSupabaseError('uploadStory insert', error, { userId, fileKey });
    await supabase.storage.from(STORY_BUCKET).remove([imagePath]);
  }

  return { data, error };
}

export async function pickStoryPhoto() {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    return { uri: null, error: { message: 'Kamera erişim izni gerekli.' } };
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    allowsEditing: false,
    quality: 1,
  });

  if (result.canceled) {
    return { uri: null, error: null };
  }

  const asset = result.assets?.[0];
  if (!asset?.uri) {
    return { uri: null, error: { message: 'Fotoğraf alınamadı.' } };
  }

  return { uri: asset.uri, error: null };
}

export async function captureAndShareStory(userId) {
  const { uri, error: pickError } = await pickStoryPhoto();
  if (pickError) {
    return { data: null, error: pickError };
  }
  if (!uri) {
    return { data: null, error: null };
  }

  return uploadStory(userId, uri);
}
