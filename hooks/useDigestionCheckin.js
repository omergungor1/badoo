import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { saveDigestionCheckin } from '../services/digestionCheckinService';
import { claimCheckinSlotIfNeeded } from '../utils/digestionCheckinStorage';
import { toISODate } from '../utils/date';

/**
 * Sabah / öğleden sonra (14:00) günde max 2 check-in modalı.
 * Slot açıldığında hemen shown=true yazılır; dismiss/save fark etmez.
 */
export function useDigestionCheckin(userId, enabled = true) {
  const [visible, setVisible] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState('morning');
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const appState = useRef(AppState.currentState);
  const evaluating = useRef(false);

  const evaluate = useCallback(async () => {
    if (!enabled || !userId || evaluating.current) return;
    evaluating.current = true;
    try {
      const result = await claimCheckinSlotIfNeeded(new Date());
      if (result.shouldShow) {
        setTimeOfDay(result.timeOfDay);
        setVisible(true);
      }
    } finally {
      evaluating.current = false;
    }
  }, [enabled, userId]);

  useEffect(() => {
    if (!enabled || !userId) return undefined;

    // İlk mount (splash sonrası)
    const bootTimer = setTimeout(() => {
      evaluate();
    }, 800);

    const sub = AppState.addEventListener('change', (nextState) => {
      const wasBackground = appState.current.match(/inactive|background/);
      appState.current = nextState;
      if (wasBackground && nextState === 'active') {
        evaluate();
      }
    });

    return () => {
      clearTimeout(bootTimer);
      sub.remove();
    };
  }, [enabled, userId, evaluate]);

  const dismiss = useCallback(() => {
    setVisible(false);
  }, []);

  const save = useCallback(
    async (payload) => {
      if (!userId || saving) return;
      setSaving(true);
      const { error } = await saveDigestionCheckin(userId, {
        checkinDate: toISODate(),
        timeOfDay: payload.timeOfDay,
        feelingOk: payload.feelingOk,
        symptoms: payload.symptoms,
        followUp: payload.followUp,
      });
      setSaving(false);

      if (error) {
        setToastMessage('Kayıt başarısız, tekrar dene');
        return;
      }

      setVisible(false);
      setToastMessage('Kaydedildi');
    },
    [userId, saving],
  );

  const clearToast = useCallback(() => setToastMessage(''), []);

  return {
    visible,
    timeOfDay,
    saving,
    toastMessage,
    dismiss,
    save,
    clearToast,
  };
}
