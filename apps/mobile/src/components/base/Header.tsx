import {
  View,
  Text,
  StyleSheet,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Menu,
  Settings,
  QrCode,
  ChevronDown,
} from 'lucide-react-native';
import { useColors } from '@theme';
import { useTranslation } from 'react-i18next';
import { Spacing, Typography, Layout, IconSize } from '@design/tokens';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightIcon?: 'qr' | 'settings' | 'menu' | 'chevron' | React.ReactElement;
  onRightPress?: () => void;
  showMenu?: boolean;
  onMenuPress?: () => void;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  translucent?: boolean;
  testID?: string;
  rightAccessibilityLabel?: string;
}

export function Header({
  title,
  subtitle,
  onBack,
  rightIcon,
  onRightPress,
  showMenu = false,
  onMenuPress,
  style,
  backgroundColor,
  translucent = false,
  testID,
  rightAccessibilityLabel,
}: HeaderProps) {
  const colors = useColors();
  const { t } = useTranslation();

  const bgColor =
    backgroundColor ?? (translucent ? 'transparent' : colors.surface);
  const borderColor = translucent ? 'transparent' : colors.border;

  return (
    <SafeAreaView style={[{ backgroundColor: bgColor }, style]}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: bgColor,
            borderBottomWidth: translucent ? 0 : 1,
            borderBottomColor: borderColor,
          },
          translucent && styles.translucent,
        ]}
        testID={testID}
      >
        {onBack ? (
          <Pressable
            onPress={onBack}
            style={styles.iconButton}
            accessibilityLabel={t('common.back')}
            accessibilityRole="button"
          >
            <ArrowLeft
              size={IconSize.lg}
              strokeWidth={2.5}
              color={colors.textPrimary}
            />
          </Pressable>
        ) : showMenu ? (
          <Pressable
            onPress={onMenuPress}
            style={styles.iconButton}
            accessibilityLabel={t('common.menu')}
            accessibilityRole="button"
          >
            <Menu
              size={IconSize.lg}
              strokeWidth={2}
              color={colors.textPrimary}
            />
          </Pressable>
        ) : (
          <View style={styles.iconButton} />
        )}

        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>

        {rightIcon && onRightPress ? (
          <Pressable
            onPress={onRightPress}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel={rightAccessibilityLabel}
          >
            {typeof rightIcon === 'object' ? (
              rightIcon
            ) : rightIcon === 'qr' ? (
              <QrCode
                size={IconSize.lg}
                strokeWidth={2}
                color={colors.textPrimary}
              />
            ) : rightIcon === 'settings' ? (
              <Settings
                size={IconSize.lg}
                strokeWidth={2}
                color={colors.textPrimary}
              />
            ) : rightIcon === 'menu' ? (
              <Menu
                size={IconSize.lg}
                strokeWidth={2}
                color={colors.textPrimary}
              />
            ) : rightIcon === 'chevron' ? (
              <ChevronDown
                size={IconSize.lg}
                strokeWidth={2}
                color={colors.textPrimary}
              />
            ) : null}
          </Pressable>
        ) : (
          <View style={styles.iconButton} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    height: Layout.headerHeight,
  },
  translucent: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  content: { flex: 1 },
  title: { ...Typography.h3, fontWeight: '700' },
  subtitle: { ...Typography.bodySmall, marginTop: 2 },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
