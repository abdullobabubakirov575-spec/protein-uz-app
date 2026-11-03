import { forwardRef, useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, TextInput, View, type TextInputInstance, type TextInputProps } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { useAdaptiveLayout } from '@/theme/adaptive';
import { colors } from '@/theme/colors';
import { AppText } from './AppText';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  prefix?: ReactNode;
}

export const FormField = forwardRef<TextInputInstance, FormFieldProps>(function FormField(
  { label, error, prefix, style, onFocus, onBlur, multiline, ...rest },
  ref,
) {
  const { radius } = useAdaptiveLayout();
  const [focused, setFocused] = useState(false);
  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  useEffect(() => {
    if (!error) return;
    shake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-5, { duration: 50 }),
      withTiming(5, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  }, [error, shake]);

  const borderColor = error ? colors.danger : focused ? colors.accent : colors.border;

  return (
    <View style={styles.container}>
      <AppText variant="callout" color={colors.textSecondary} style={styles.label}>
        {label}
      </AppText>
      <Animated.View
        style={[
          styles.field,
          { borderRadius: radius.control, borderColor, minHeight: multiline ? 96 : 54 },
          multiline && styles.multiline,
          shakeStyle,
        ]}
      >
        {prefix}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textTertiary}
          selectionColor={colors.accent}
          cursorColor={colors.accent}
          keyboardAppearance="dark"
          multiline={multiline}
          style={[styles.input, multiline && styles.inputMultiline, style]}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...rest}
        />
      </Animated.View>
      {error ? (
        <Animated.View entering={FadeIn.duration(180)}>
          <AppText variant="caption" color={colors.danger}>
            {error}
          </AppText>
        </Animated.View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: { fontWeight: '600', marginLeft: 4 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    paddingHorizontal: 16,
    borderCurve: 'continuous',
  },
  multiline: { alignItems: 'flex-start', paddingVertical: 12 },
  input: { flex: 1, color: colors.text, fontSize: 17, paddingVertical: 14 },
  inputMultiline: { paddingVertical: 0, minHeight: 72, textAlignVertical: 'top' },
});
