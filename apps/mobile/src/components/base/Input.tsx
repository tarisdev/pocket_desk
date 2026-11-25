import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import React from 'react';
import { useColors } from '@theme';
import { useTranslation } from 'react-i18next';
import { Spacing, BorderRadius, Typography } from '@design/tokens';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  error?: string;
  helperText?: string;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  testID?: string;
  accessibilityLabel?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  leftIcon?: React.ReactElement;
  rightIcon?: React.ReactElement;
  onRightIconPress?: () => void;
}

export function Input({
  value,
  onChangeText,
  placeholder,
  label,
  secureTextEntry = false,
  keyboardType,
  autoCapitalize = 'none',
  error,
  helperText,
  style,
  containerStyle,
  disabled = false,
  testID,
  accessibilityLabel,
  onFocus,
  onBlur,
  leftIcon,
  rightIcon,
  onRightIconPress,
}: InputProps) {
  const colors = useColors();
  const { t } = useTranslation();
  const hasError = !!error;
  const [focused, setFocused] = React.useState(false);

  const borderColor = hasError
    ? colors.error
    : focused
      ? colors.primary
      : colors.border;
  const bgColor = disabled ? colors.backgroundSecondary : colors.surface;

  const inputWrapperStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: bgColor,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor,
  } as ViewStyle;

  const inputStyle = {
    ...Typography.body,
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    minHeight: 52,
    color: colors.textPrimary,
  } as TextStyle;

  const labelStyle = {
    ...Typography.label,
    marginBottom: Spacing.xs,
    color: colors.textSecondary,
  } as TextStyle;

  const helperTextStyle = {
    ...Typography.caption,
    marginTop: Spacing.xs,
  } as TextStyle;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            labelStyle,
            hasError && { color: colors.error },
            disabled && { color: colors.textMuted },
            focused && !hasError && { color: colors.primary },
          ]}
        >
          {label}
        </Text>
      )}
      <View style={[inputWrapperStyle]}>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          style={[
            inputStyle,
            hasError && {
              borderColor: colors.error,
              backgroundColor: colors.error + '10',
            },
            disabled && {
              backgroundColor: colors.backgroundSecondary,
              color: colors.textMuted,
            },
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            style,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={!disabled}
          testID={testID}
          accessibilityLabel={accessibilityLabel}
          accessibilityState={{ disabled }}
          onFocus={() => {
            setFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          placeholderTextColor={colors.textMuted}
        />
        {rightIcon && (
          <Pressable
            onPress={onRightIconPress}
            style={styles.iconRight}
            accessibilityLabel={t('common.toggleVisibility')}
          >
            {rightIcon}
          </Pressable>
        )}
      </View>
      {(hasError ? error : helperText) && (
        <Text
          style={[
            helperTextStyle,
            hasError && { color: colors.error },
            !hasError && { color: colors.textMuted },
          ]}
        >
          {hasError ? error : helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.md, width: '100%' },
  iconLeft: { paddingLeft: Spacing.md },
  iconRight: { paddingRight: Spacing.md },
  inputWithLeftIcon: { paddingLeft: 0 },
  inputWithRightIcon: { paddingRight: 0 },
});
