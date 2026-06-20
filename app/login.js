import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import AppLogo from '../components/ui/AppLogo';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { APP_SLOGAN } from '../constants/app';
import { colors, spacing, typography } from '../theme';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Hata', 'E-posta ve şifre gerekli.');
      return;
    }

    setLoading(true);
    const { error, message } = await signIn(email.trim(), password);
    setLoading(false);

    if (error) {
      Alert.alert('Giriş başarısız', message || error.message);
      return;
    }

    router.replace('/');
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <AppLogo size={120} />
        <Text style={styles.subtitle}>{APP_SLOGAN}</Text>

        <View style={styles.form}>
          <Input label="E-posta" value={email} onChangeText={setEmail} placeholder="ornek@mail.com" keyboardType="email-address" />
          <Input label="Şifre" value={password} onChangeText={setPassword} placeholder="••••••••" />
          <Button title="Giriş Yap" onPress={handleLogin} loading={loading} />
        </View>

        <Text style={styles.footer}>
          Hesabın yok mu? <Link href="/register" style={styles.link}>Kayıt ol</Link>
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
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  form: { gap: spacing.md, marginTop: spacing.lg },
  footer: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center' },
  link: { color: colors.primary, fontFamily: typography.bodyBold.fontFamily },
});
