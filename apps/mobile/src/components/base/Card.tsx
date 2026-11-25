import {
  View,
  StyleSheet,
  Animated,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import React from 'react';
import { useColors } from '@theme';
import { Spacing, BorderRadius, Shadows } from '@design/tokens';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevation?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  padding?: number;
  radius?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  onPress?: () => void;
  disabled?: boolean;
  testID?: string;
}

export function Card({
  children,
  style,
  elevation = 'md',
  padding = Spacing.lg,
  radius = BorderRadius.xl,
  backgroundColor,
  borderColor,
  borderWidth = 1,
  onPress,
  disabled = false,
  testID,
}: CardProps) {
  const colors = useColors();

  const shadowKey = elevation as keyof typeof Shadows;
  const shadow = Shadows[shadowKey] || Shadows.md;

  const bg = backgroundColor ?? colors.surface;
  const border = borderColor ?? colors.border;

  const content = (
    <View
      style={[
        styles.cardBase,
        {
          padding,
          borderRadius: radius,
          backgroundColor: bg,
          borderWidth,
          borderColor: border,
          ...shadow,
        },
        style,
      ]}
      testID={testID}
    >
      {children}
    </View>
  );

  if (!onPress || disabled) return content;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.touchable,
        { borderRadius: radius },
        pressed && { opacity: 0.85 },
      ]}
    >
      <Animated.View style={styles.touchableInner}>{content}</Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardBase: { overflow: 'hidden' },
  touchable: { borderRadius: BorderRadius.xl, overflow: 'hidden' },
  touchableInner: { borderRadius: BorderRadius.xl, overflow: 'hidden' },
});
