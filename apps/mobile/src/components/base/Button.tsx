import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import React from 'react';
import { useColors } from '@theme';
import {
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
  TouchTarget,
} from '@design/tokens';

type ButtonVariant =
  'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glass';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactElement;
  iconPosition?: 'start' | 'end';
  testID?: string;
  accessibilityLabel?: string;
}

const sizeConfig: Record<
  ButtonSize,
  { paddingV: number; paddingH: number; minHeight: number; fontSize: number }
> = {
  sm: {
    paddingV: Spacing.sm,
    paddingH: Spacing.md,
    minHeight: TouchTarget.minimum,
    fontSize: 13,
  },
  md: {
    paddingV: Spacing.md,
    paddingH: Spacing.lg,
    minHeight: TouchTarget.comfortable,
    fontSize: 15,
  },
  lg: {
    paddingV: Spacing.lg,
    paddingH: Spacing.xl,
    minHeight: TouchTarget.large,
    fontSize: 17,
  },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  icon,
  iconPosition = 'start',
  testID,
  accessibilityLabel,
}: ButtonProps) {
  const colors = useColors();

  const isDisabled = disabled || loading;
  const cfg = sizeConfig[size];

  const variants: Record<
    ButtonVariant,
    { bg: string; text: string; border: string; pressedBg: string }
  > = {
    primary: {
      bg: colors.primary,
      text: colors.textOnPrimary,
      border: colors.primary,
      pressedBg: colors.primaryHover,
    },
    secondary: {
      bg: colors.secondary,
      text: colors.textOnPrimary,
      border: colors.secondary,
      pressedBg: colors.secondary,
    },
    outline: {
      bg: 'transparent',
      text: colors.primary,
      border: colors.primary,
      pressedBg: colors.primaryLight,
    },
    ghost: {
      bg: 'transparent',
      text: colors.textSecondary,
      border: 'transparent',
      pressedBg: colors.backgroundSecondary,
    },
    danger: {
      bg: colors.error,
      text: colors.textOnPrimary,
      border: colors.error,
      pressedBg: colors.error,
    },
    glass: {
      bg: colors.glass,
      text: colors.textPrimary,
      border: colors.glassBorder,
      pressedBg: colors.backgroundSecondary,
    },
  };

  const v = variants[variant];
  const bgColor = isDisabled ? colors.backgroundSecondary : v.bg;
  const textColor = isDisabled ? colors.textMuted : v.text;
  const borderColor = isDisabled ? colors.border : v.border;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.container,
        fullWidth && styles.fullWidth,
        {
          backgroundColor: pressed && !isDisabled ? v.pressedBg : bgColor,
          borderWidth: variant === 'outline' || variant === 'glass' ? 1 : 0,
          borderColor,
          borderRadius: BorderRadius.lg,
          minHeight: cfg.minHeight,
          paddingVertical: cfg.paddingV,
          paddingHorizontal: cfg.paddingH,
          ...Shadows[
            variant === 'ghost' || variant === 'outline' ? 'none' : 'sm'
          ],
        },
        style,
      ]}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={textColor}
          style={styles.spinner}
        />
      ) : (
        <View style={[styles.row, iconPosition === 'end' && styles.rowReverse]}>
          {icon && iconPosition === 'start' && (
            <View style={styles.iconWrapper}>{icon}</View>
          )}
          <Text
            style={[styles.text, { color: textColor, fontSize: cfg.fontSize }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
          {icon && iconPosition === 'end' && (
            <View style={styles.iconWrapperEnd}>{icon}</View>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: { width: '100%' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  rowReverse: { flexDirection: 'row-reverse' },
  text: { ...Typography.button },
  iconWrapper: { marginRight: Spacing.sm },
  iconWrapperEnd: { marginLeft: Spacing.sm },
  spinner: { marginLeft: Spacing.sm },
});
