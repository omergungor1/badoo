import { Alert } from 'react-native';

export function confirmCancel(onConfirm) {
  Alert.alert(
    'Emin misiniz?',
    'Kaydetmeden çıkmak istediğinize emin misiniz?',
    [
      { text: 'Hayır', style: 'cancel' },
      { text: 'Çık', style: 'destructive', onPress: onConfirm },
    ],
  );
}
