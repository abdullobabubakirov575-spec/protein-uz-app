import { router, Stack } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, type TextInputInstance } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { ApiError } from '@/api/client';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { HeaderIconButton } from '@/components/HeaderIconButton';
import { Icon } from '@/components/Icon';
import { PressableScale } from '@/components/PressableScale';
import { useAuth } from '@/features/account/AuthProvider';
import { useLocale } from '@/i18n/LocaleProvider';
import { haptic } from '@/lib/haptics';
import { useAdaptiveLayout } from '@/theme/adaptive';
import { colors } from '@/theme/colors';

type Mode = 'signIn' | 'signUp';

const MAX_WIDTH = 480;

export default function AuthScreen() {
  const { t } = useLocale();
  const { gutter } = useAdaptiveLayout();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('signIn');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const passwordInput = useRef<TextInputInstance>(null);

  const submit = async () => {
    if (!username.trim() || !password) {
      setError(t.auth.required);
      haptic.error();
      return;
    }
    setBusy(true);
    setError('');
    try {
      await (mode === 'signIn' ? signIn : signUp)(username.trim(), password);
      haptic.success();
      router.back();
    } catch (failure) {
      haptic.error();
      if (failure instanceof ApiError && failure.isNetwork) setError(t.common.networkError);
      else if (failure instanceof ApiError && !failure.message.startsWith('http_')) setError(failure.message);
      else setError(t.common.genericError);
    } finally {
      setBusy(false);
    }
  };

  const switchMode = () => {
    haptic.selection();
    setError('');
    setMode(mode === 'signIn' ? 'signUp' : 'signIn');
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => <HeaderIconButton icon="xmark" label={t.common.close} onPress={() => router.back()} />,
        }}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingHorizontal: gutter }]}
      >
        <View style={styles.column}>
          <Animated.View entering={FadeInDown.duration(380)} style={styles.hero}>
            <View style={styles.logo}>
              <Icon name="person.crop.circle.fill" size={34} color={colors.onAccent} />
            </View>
            <Animated.View key={mode} entering={FadeIn.duration(200)} style={styles.titles}>
              <AppText variant="display" align="center">
                {mode === 'signIn' ? t.auth.signInTitle : t.auth.signUpTitle}
              </AppText>
              <AppText variant="body" color={colors.textSecondary} align="center">
                {t.auth.subtitle}
              </AppText>
            </Animated.View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(80).duration(380)} style={styles.form}>
            <FormField
              testID="auth-username"
              label={t.auth.username}
              placeholder={t.auth.usernamePlaceholder}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="username"
              autoComplete="username"
              returnKeyType="next"
              onSubmitEditing={() => passwordInput.current?.focus()}
            />
            <FormField
              ref={passwordInput}
              testID="auth-password"
              label={t.auth.password}
              placeholder={t.auth.passwordPlaceholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType={mode === 'signIn' ? 'password' : 'newPassword'}
              autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
              returnKeyType="go"
              onSubmitEditing={submit}
            />
            {error ? (
              <Animated.View entering={FadeIn} style={styles.error}>
                <Icon name="exclamationmark.triangle.fill" size={14} color={colors.danger} />
                <AppText variant="callout" color={colors.danger} style={styles.flex}>
                  {error}
                </AppText>
              </Animated.View>
            ) : null}
            <Button
              testID="auth-submit"
              label={mode === 'signIn' ? t.auth.signIn : t.auth.signUp}
              loading={busy}
              onPress={submit}
            />
            <PressableScale onPress={switchMode} style={styles.switch}>
              <AppText variant="callout" color={colors.accent} align="center" style={styles.switchText}>
                {mode === 'signIn' ? t.auth.switchToSignUp : t.auth.switchToSignIn}
              </AppText>
            </PressableScale>
          </Animated.View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 16, paddingBottom: 40, alignItems: 'center' },
  column: { width: '100%', maxWidth: MAX_WIDTH, gap: 28 },
  hero: { alignItems: 'center', gap: 16 },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  titles: { gap: 6 },
  form: { gap: 16 },
  error: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flex: { flex: 1 },
  switch: { paddingVertical: 8 },
  switchText: { fontWeight: '600' },
});
