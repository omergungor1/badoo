import { getMessaging } from '../lib/firebaseMessaging';

const noopUnsubscribe = () => {};

export async function requestPushPermission() {
  const messaging = getMessaging();
  if (!messaging) {
    return false;
  }

  const authStatus = await messaging().requestPermission();
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
}

export async function getFcmToken() {
  const messaging = getMessaging();
  if (!messaging) {
    return null;
  }

  const enabled = await requestPushPermission();
  if (!enabled) {
    return null;
  }

  await messaging().registerDeviceForRemoteMessages();
  return messaging().getToken();
}

export function subscribeToTokenRefresh(onToken) {
  const messaging = getMessaging();
  if (!messaging) {
    return noopUnsubscribe;
  }

  return messaging().onTokenRefresh(onToken);
}

export function subscribeToForegroundMessages(onMessage) {
  const messaging = getMessaging();
  if (!messaging) {
    return noopUnsubscribe;
  }

  return messaging().onMessage(onMessage);
}

export function subscribeToNotificationOpened(onOpen) {
  const messaging = getMessaging();
  if (!messaging) {
    return noopUnsubscribe;
  }

  const unsubscribeOpened = messaging().onNotificationOpenedApp(onOpen);

  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        onOpen(remoteMessage);
      }
    });

  return unsubscribeOpened;
}
