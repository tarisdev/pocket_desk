import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import React, { useMemo } from 'react';
import { useColors } from '@theme';
import { Spacing, BorderRadius, Typography, Shadows } from '@design/tokens';

interface WidgetCardProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
  accentColor?: string;
  badge?: React.ReactNode;
  loading?: boolean;
  error?: string;
  testID?: string;
  onPress?: () => void;
  disabled?: boolean;
}

export function WidgetCard({
  children,
  title,
  subtitle,
  style,
  accentColor,
  badge,
  loading = false,
  error,
  testID,
  onPress,
  disabled = false,
}: WidgetCardProps) {
  const colors = useColors();
  const accent = accentColor ?? colors.primary;

  const skeleton = useMemo(() => {
    if (!loading) return null;
    return (
      <View style={styles.skeletonContainer} testID={`${testID}-skeleton`}>
        <View
          style={[
            styles.skeletonLine,
            { backgroundColor: colors.backgroundTertiary },
          ]}
        />
        <View
          style={[
            styles.skeletonLine,
            { width: '70%', backgroundColor: colors.backgroundTertiary },
          ]}
        />
        <View
          style={[
            styles.skeletonLineFull,
            { backgroundColor: colors.backgroundTertiary },
          ]}
        />
        <View
          style={[
            styles.skeletonLineFull,
            { width: '60%', backgroundColor: colors.backgroundTertiary },
          ]}
        />
        <View
          style={[
            styles.skeletonLineFull,
            { width: '40%', backgroundColor: colors.backgroundTertiary },
          ]}
        />
      </View>
    );
  }, [loading, testID]);

  const content = (
    <View
      style={[
        styles.container,
        {
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          ...Shadows.xs,
        },
        style,
      ]}
      testID={testID}
    >
      <View style={styles.header}>
        {badge && <View style={styles.badgeWrapper}>{badge}</View>}
        <View style={styles.textWrapper}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
        {accent && (
          <View style={[styles.accent, { backgroundColor: accent }]} />
        )}
      </View>
      <View style={styles.content}>{children}</View>
      {error && (
        <View
          style={[
            {
              marginTop: Spacing.md,
              padding: Spacing.sm,
              borderRadius: BorderRadius.md,
              backgroundColor: colors.error + '10',
              borderWidth: 1,
              borderColor: colors.error + '30',
            },
          ]}
        >
          <Text style={[{ ...Typography.caption, color: colors.error }]}>
            {error}
          </Text>
        </View>
      )}
    </View>
  );

  if (onPress && !disabled) {
    return (
      <Animated.View style={styles.touchable}>
        <Pressable
          onPress={onPress}
          disabled={disabled}
          style={({ pressed }) => [
            styles.pressable,
            pressed && { opacity: 0.85 },
          ]}
        >
          {loading ? skeleton : content}
        </Pressable>
      </Animated.View>
    );
  }

  return loading ? skeleton : content;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  textWrapper: { flex: 1, marginRight: Spacing.sm },
  title: { ...Typography.label, fontWeight: '600', letterSpacing: 0.1 },
  subtitle: { ...Typography.caption, marginTop: 1 },
  badgeWrapper: { marginLeft: Spacing.sm, flexShrink: 0 },
  accent: { width: 2, height: 16, borderRadius: 2 },
  content: {},
  skeletonContainer: { gap: Spacing.sm },
  skeletonLine: { height: 14, borderRadius: 7 },
  skeletonLineFull: { height: 11, borderRadius: 5 },
  touchable: { borderRadius: BorderRadius.lg, overflow: 'hidden' },
  pressable: { borderRadius: BorderRadius.lg, overflow: 'hidden' },
});
