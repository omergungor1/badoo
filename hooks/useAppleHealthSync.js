import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { syncTodayAppleHealthActivity } from '../services/appleHealthService';

const SYNC_INTERVAL_MS = 15 * 60 * 1000;

export function useAppleHealthSync(userId, onSynced) {
  const appState = useRef(AppState.currentState);
  const syncingRef = useRef(false);
  const onSyncedRef = useRef(onSynced);

  useEffect(() => {
    onSyncedRef.current = onSynced;
  }, [onSynced]);

  const sync = useCallback(async () => {
    if (!userId || syncingRef.current) return null;

    syncingRef.current = true;
    try {
      const result = await syncTodayAppleHealthActivity(userId);
      if (result.synced) {
        onSyncedRef.current?.(result);
      }
      return result;
    } finally {
      syncingRef.current = false;
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return undefined;

    sync();

    const intervalId = setInterval(() => {
      if (appState.current === 'active') {
        sync();
      }
    }, SYNC_INTERVAL_MS);

    const subscription = AppState.addEventListener('change', (nextState) => {
      const wasBackground = appState.current.match(/inactive|background/);
      appState.current = nextState;

      if (wasBackground && nextState === 'active') {
        sync();
      }
    });

    return () => {
      clearInterval(intervalId);
      subscription.remove();
    };
  }, [userId, sync]);

  return sync;
}
