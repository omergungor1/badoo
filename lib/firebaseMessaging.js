import Constants from 'expo-constants';
import { NativeModules, Platform } from 'react-native';

export function isPushSupported() {
  if (Platform.OS !== 'ios') {
    return false;
  }

  // Expo Go native Firebase modülünü içermez.
  if (Constants.appOwnership === 'expo') {
    return false;
  }

  return !!NativeModules.RNFBAppModule;
}

export function getMessaging() {
  if (!isPushSupported()) {
    return null;
  }

  try {
    return require('@react-native-firebase/messaging').default;
  } catch {
    return null;
  }
}
