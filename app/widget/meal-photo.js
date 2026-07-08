import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { setPendingMealCapture } from '../../utils/widgetLaunch';

export default function WidgetMealPhotoScreen() {
  useEffect(() => {
    setPendingMealCapture(true);
  }, []);

  return <Redirect href="/(tabs)" />;
}
