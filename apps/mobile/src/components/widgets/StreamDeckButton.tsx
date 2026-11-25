import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
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

interface StreamDeckButtonProps {
  label: string;
  icon?: React.ReactElement;
  color?: string;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: number;
}

export function StreamDeckButton({
  label,
  icon,
  color,
  onPress,
  disabled = false,
  testID,
  size,
}: StreamDeckButtonProps) {
  const colors = useColors();
  const resolvedColor = color ?? colors.primary;
  const { width } = useWindowDimensions();
  const columns = Math.min(4, Math.max(2, Math.floor(width / 100)));
  const buttonSize =
    size ?? (width - 32 - Spacing.md * (columns - 1)) / columns;

  const bgColor = disabled ? colors.backgroundSecondary : resolvedColor;
  const textColor = disabled ? colors.textMuted : colors.textOnPrimary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.container,
        {
          width: buttonSize,
          height: buttonSize,
          backgroundColor: bgColor,
          minHeight: TouchTarget.comfortable,
        },
      ]}
      activeOpacity={0.85}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      {icon && <View style={styles.iconWrapper}>{icon}</View>}
      <Text style={[styles.label, { color: textColor }]} numberOfLines={2}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    ...Shadows.sm,
  },
  iconWrapper: { marginBottom: Spacing.xs },
  label: {
    ...Typography.bodySmall,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
});
