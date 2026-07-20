import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '../lib/supabase';
import { logSupabaseError } from '../lib/networkLog';
import { MEAL_PHOTO_BUCKET } from '../constants/meals';
import { addMealPhotoLog } from './foodService';

async function uriToArrayBuffer(uri) {
  const response = await fetch(uri);
  return response.arrayBuffer();
}

export async function uploadMealPhoto(userId, sourceUri) {
  const fileKey = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  const compressed = await ImageManipulator.manipulateAsync(
    sourceUri,
    [{ resize: { width: 1080 } }],
    { compress: 0.82, format: ImageManipulator.SaveFormat.JPEG },
  );

  const imagePath = `${userId}/${fileKey}.jpg`;
  const buffer = await uriToArrayBuffer(compressed.uri);

  const { error: uploadError } = await supabase.storage
    .from(MEAL_PHOTO_BUCKET)
    .upload(imagePath, buffer, { contentType: 'image/jpeg' });

  if (uploadError) {
    logSupabaseError('uploadMealPhoto storage', uploadError, { userId, fileKey });
    return { data: null, error: uploadError };
  }

  const { data: urlData } = supabase.storage.from(MEAL_PHOTO_BUCKET).getPublicUrl(imagePath);
  const imageUrl = urlData.publicUrl;

  const { data, error } = await addMealPhotoLog({
    userId,
    imageUrl,
    imagePath,
    mealTitle: 'Öğün',
  });

  if (error) {
    logSupabaseError('uploadMealPhoto insert', error, { userId, fileKey });
    await supabase.storage.from(MEAL_PHOTO_BUCKET).remove([imagePath]);
  }

  return { data, error };
}

export async function deleteMealPhoto(imagePath) {
  if (!imagePath) return { error: null };

  const { error } = await supabase.storage.from(MEAL_PHOTO_BUCKET).remove([imagePath]);
  if (error) {
    logSupabaseError('deleteMealPhoto storage', error, { imagePath });
  }

  return { error };
}
