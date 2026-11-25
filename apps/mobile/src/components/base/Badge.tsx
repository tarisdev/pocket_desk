import {
  View,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import React from 'react';
import { useColors } from '@theme';
import { Spacing, BorderRadius, Typography } from '@design/tokens';

type BadgeVariant =
  'default' | 'success' | 'warning' | 'error' | 'primary' | 'outline' | 'ghost';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const sizeConfig: Record<
  BadgeSize,
  { paddingH: number; paddingV: number; fontSize: number; minHeight: number }
> = {
  sm: {
    paddingH: Spacing.sm,
    paddingV: Spacing.xs,
    fontSize: 10,
    minHeight: 20,
  },
  md: {
    paddingH: Spacing.md,
    paddingV: Spacing.xs,
    fontSize: 11,
    minHeight: 22,
  },
  lg: {
    paddingH: Spacing.lg,
    paddingV: Spacing.sm,
    fontSize: 13,
    minHeight: 28,
  },
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  style,
  testID,
}: BadgeProps) {
  const colors = useColors();
  const cfg = sizeConfig[size];

  const variants: Record<
    BadgeVariant,
    { bg: string; text: string; border: string }
  > = {
    default: {
      bg: colors.backgroundSecondary,
      text: colors.textSecondary,
      border: 'transparent',
    },
    success: {
      bg: colors.success,
      text: colors.textOnPrimary,
      border: 'transparent',
    },
    warning: {
      bg: colors.warning,
      text: colors.textOnPrimary,
      border: 'transparent',
    },
    error: {
      bg: colors.error,
      text: colors.textOnPrimary,
      border: 'transparent',
    },
    primary: {
      bg: colors.primary,
      text: colors.textOnPrimary,
      border: 'transparent',
    },
    outline: {
      bg: 'transparent',
      text: colors.primary,
      border: colors.primary,
    },
    ghost: {
      bg: 'transparent',
      text: colors.textSecondary,
      border: 'transparent',
    },
  };

  const v = variants[variant];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: v.bg,
          borderWidth: v.border !== 'transparent' ? 1 : 0,
          borderColor: v.border,
          borderRadius: BorderRadius.full,
          minHeight: cfg.minHeight,
          paddingHorizontal: cfg.paddingH,
          paddingVertical: cfg.paddingV,
        },
        style,
      ]}
      testID={testID}
    >
      <Text
        style={[styles.text, { color: v.text, fontSize: cfg.fontSize }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: { ...Typography.caption, fontWeight: '700', lineHeight: 16 },
});
