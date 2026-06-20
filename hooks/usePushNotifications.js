import { useEffect } from 'react';
import { isPushSupported } from '../lib/firebaseMessaging';
import {
  getFcmToken,
  subscribeToForegroundMessages,
  subscribeToNotificationOpened,
  subscribeToTokenRefresh,
} from '../services/pushNotificationService';
import { removePushToken, savePushToken } from '../services/pushTokenService';

export function usePushNotifications(userId) {
  useEffect(() => {
    if (!userId || !isPushSupported()) {
      return undefined;
    }

    let activeToken = null;
    let cancelled = false;

    async function syncToken() {
      try {
        const token = await getFcmToken();
        if (cancelled || !token || token === activeToken) {
          return;
        }

        activeToken = token;
        await savePushToken(userId, token, 'ios');
      } catch (error) {
        if (__DEV__) {
          console.warn('[FCM] token alınamadı', error);
        }
      }
    }

    syncToken();

    const unsubscribeTokenRefresh = subscribeToTokenRefresh(async (token) => {
      activeToken = token;
      await savePushToken(userId, token, 'ios');
    });

    const unsubscribeForeground = subscribeToForegroundMessages((remoteMessage) => {
      if (__DEV__) {
        console.log('[FCM] foreground message', remoteMessage?.notification?.title);
      }
    });

    const unsubscribeOpened = subscribeToNotificationOpened((remoteMessage) => {
      if (__DEV__) {
        console.log('[FCM] notification opened', remoteMessage?.data);
      }
    });

    return () => {
      cancelled = true;
      unsubscribeTokenRefresh();
      unsubscribeForeground();
      unsubscribeOpened();

      if (activeToken) {
        removePushToken(userId, activeToken);
      }
    };
  }, [userId]);
}
