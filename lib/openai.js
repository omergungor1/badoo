import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? Constants.manifest?.extra ?? {};

export const openAiApiKey =
  process.env.OPENAI_API_KEY ||
  process.env.EXPO_PUBLIC_OPENAI_API_KEY ||
  extra.openAiApiKey;

export function getOpenAiApiKey() {
  return openAiApiKey || null;
}
