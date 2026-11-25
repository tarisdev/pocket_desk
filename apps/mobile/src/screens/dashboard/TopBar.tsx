import { View, Text, Pressable, StyleSheet } from 'react-native';
import React from 'react';
import { useColors } from '@theme';
import { useTranslation } from 'react-i18next';
import {
  Settings,
  PanelBottomClose,
  PanelBottomOpen,
} from 'lucide-react-native';
import { Spacing, Typography } from '@design/tokens';

interface TopBarProps {
  status: 'disconnected' | 'connecting' | 'connected' | 'paired';
  statusLabel: string;
  isBottomNavVisible: boolean;
  onToggleBottomNav: () => void;
  onEditPress: () => void;
  insets: { top: number; left: number; right: number };
}

const SCREEN_PADDING = Spacing.md;

export function TopBar({
  status,
  statusLabel,
  isBottomNavVisible,
  onToggleBottomNav,
  onEditPress,
  insets,
}: TopBarProps) {
  const colors = useColors();
  const { t } = useTranslation();
  const screenPaddingLeft = SCREEN_PADDING + insets.left;
  const screenPaddingRight = SCREEN_PADDING + insets.right;

  return (
    <View style={[styles.topBarWrap, { paddingTop: insets.top }]}>
      <View
        style={[
          styles.topBar,
          { paddingLeft: screenPaddingLeft, paddingRight: screenPaddingRight },
        ]}
      >
        <View style={styles.topBarLeft}>
          <Text style={[styles.appName, { color: colors.textPrimary }]}>
            Pocket Desk
          </Text>
          <Text
            style={[
              styles.statusText,
              {
                color:
                  status === 'paired' || status === 'connected'
                    ? colors.success
                    : colors.textMuted,
              },
            ]}
          >
            {statusLabel}
          </Text>
        </View>
        <View style={styles.topBarRight}>
          <Pressable
            style={styles.iconButton}
            onPress={() => {
              try {
                onToggleBottomNav();
              } catch (err) {
                console.error('[TopBar] toggleBottomNav error', err);
              }
            }}
            accessibilityLabel={
              isBottomNavVisible
                ? t('nav.hideNavigation')
                : t('nav.showNavigation')
            }
            accessibilityRole="button"
          >
            {isBottomNavVisible ? (
              <PanelBottomClose
                size={20}
                strokeWidth={2}
                color={colors.textPrimary}
              />
            ) : (
              <PanelBottomOpen
                size={20}
                strokeWidth={2}
                color={colors.textPrimary}
              />
            )}
          </Pressable>
          <Pressable
            style={styles.iconButton}
            onPress={onEditPress}
            accessibilityLabel={t('dashboard.settings')}
            accessibilityRole="button"
          >
            <Settings size={20} strokeWidth={2} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBarWrap: { width: '100%' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_PADDING,
    paddingVertical: Spacing.sm,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  topBarRight: { flexDirection: 'row', gap: Spacing.sm },
  appName: { ...Typography.label, fontWeight: '700' },
  statusText: { ...Typography.caption },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
