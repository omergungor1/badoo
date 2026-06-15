import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import AppLogo from '../components/ui/AppLogo';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { APP_NAME } from '../constants/app';
import { colors, spacing, typography } from '../theme';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!email || !password) {
      Alert.alert('Hata', 'E-posta ve şifre gerekli.');
      return;
    }

    setLoading(true);
    const { error, message } = await signUp(email.trim(), password);
    setLoading(false);

    if (error) {
      Alert.alert('Kayıt başarısız', message || error.message);
      return;
    }

    Alert.alert('Başarılı', 'Hesabın oluşturuldu. Şimdi profilini tamamlayalım.');
    router.replace('/onboarding');
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <AppLogo size={96} showTitle={false} />
        <Text style={styles.title}>Hesap Oluştur</Text>
        <Text style={styles.subtitle}>{APP_NAME} ile kendini daha iyi tanı.</Text>

        <View style={styles.form}>
          <Input label="E-posta" value={email} onChangeText={setEmail} placeholder="ornek@mail.com" keyboardType="email-address" />
          <Input label="Şifre" value={password} onChangeText={setPassword} placeholder="En az 6 karakter" />
          <Button title="Kayıt Ol" onPress={handleRegister} loading={loading} />
        </View>

        <Text style={styles.footer}>
          Zaten hesabın var mı? <Link href="/login" style={styles.link}>Giriş yap</Link>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: { ...typography.h1, color: colors.textPrimary, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  form: { gap: spacing.md, marginTop: spacing.lg },
  footer: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center' },
  link: { color: colors.primary, fontFamily: typography.bodyBold.fontFamily },
});
