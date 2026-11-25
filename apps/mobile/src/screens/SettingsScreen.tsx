import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Switch,
  ScrollView,
} from 'react-native';
import React from 'react';
import {
  Moon,
  Sun,
  Smartphone,
  Info,
  Palette,
  Shield,
  ChevronRight,
  PanelBottomClose,
  PanelBottomOpen,
} from 'lucide-react-native';
import { useColors } from '@theme';
import { Header, Card, Button, Badge } from '@components';
import { useApp } from '@context/AppContext';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '@i18n';
import type { NavigationProp } from '@react-navigation/native';
import {
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
  Layout,
  IconSize,
} from '@design/tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomNavVisibility } from '@navigator/BottomNavVisibility';

type RootStackParamList = {
  Root: undefined;
  Connection: undefined;
  Settings: undefined;
  EditMode: undefined;
};

interface SettingsScreenProps {
  navigation?: NavigationProp<RootStackParamList>;
}

export function SettingsScreen({ navigation }: SettingsScreenProps) {
  const colors = useColors();
  const { t } = useTranslation();
  const {
    theme,
    setTheme,
    keepAwake,
    setKeepAwake,
    refreshRate,
    setRefreshRate,
    orientation,
    setOrientation,
  } = useApp();

  const insets = useSafeAreaInsets();
  const { isBottomNavVisible, toggleBottomNavVisibility } =
    useBottomNavVisibility();
  const contentBottomPadding = isBottomNavVisible
    ? Layout.tabBarHeight + Spacing.md + insets.bottom
    : Spacing.md + insets.bottom;

  const refreshRateOptions = [
    { value: 500, label: t('settings.refreshOptions.fast') },
    { value: 1000, label: t('settings.refreshOptions.default') },
    { value: 2000, label: t('settings.refreshOptions.twoSec') },
    { value: 5000, label: t('settings.refreshOptions.saving') },
  ];

  const themeOptions = [
    {
      value: 'light' as const,
      label: t('settings.light'),
      icon: <Sun size={IconSize.md} strokeWidth={2} />,
    },
    {
      value: 'dark' as const,
      label: t('settings.dark'),
      icon: <Moon size={IconSize.md} strokeWidth={2} />,
    },
    {
      value: 'system' as const,
      label: t('settings.system'),
      icon: <Smartphone size={IconSize.md} strokeWidth={2} />,
    },
  ];

  return (
    <ScrollView
      style={[
        { flex: 1, backgroundColor: colors.background },
        styles.container,
      ]}
      contentContainerStyle={[
        styles.content,
        {
          paddingLeft: Spacing.lg + insets.left,
          paddingRight: Spacing.lg + insets.right,
          paddingBottom: contentBottomPadding,
        },
      ]}
    >
      <Header
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
        onBack={() => navigation?.goBack?.() || {}}
        rightIcon={
          isBottomNavVisible ? (
            <PanelBottomClose
              size={IconSize.lg}
              strokeWidth={2}
              color={colors.textPrimary}
            />
          ) : (
            <PanelBottomOpen
              size={IconSize.lg}
              strokeWidth={2}
              color={colors.textPrimary}
            />
          )
        }
        onRightPress={() => {
          try {
            toggleBottomNavVisibility();
          } catch (err) {
            console.error(
              '[SettingsScreen] toggleBottomNavVisibility error',
              err
            );
          }
        }}
        rightAccessibilityLabel={
          isBottomNavVisible ? t('nav.hideNavigation') : t('nav.showNavigation')
        }
      />

      <Card
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        elevation="md"
        padding={Spacing.lg}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {t('common.language')}
          </Text>
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            <Button
              title={t('common.english')}
              variant="outline"
              onPress={() => changeLanguage('en')}
            />
            <Button
              title={t('common.vietnamese')}
              variant="outline"
              onPress={() => changeLanguage('vi')}
            />
          </View>
        </View>
      </Card>

      <Card
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        elevation="md"
        padding={Spacing.lg}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.sectionIcon,
                { backgroundColor: colors.primary + '15' },
              ]}
            >
              <Palette
                size={IconSize.md}
                strokeWidth={2}
                color={colors.primary}
              />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t('settings.appearance')}
            </Text>
          </View>
          <View style={styles.settingBlock}>
            <View style={styles.settingInfo}>
              <Text
                style={[styles.settingTitle, { color: colors.textPrimary }]}
              >
                {t('settings.themeMode')}
              </Text>
              <Text style={[styles.settingSub, { color: colors.textMuted }]}>
                {t('settings.themeHint')}
              </Text>
            </View>
            <View style={styles.themeSelector}>
              {themeOptions.map((option) => {
                const active = theme === option.value;
                return (
                  <ThemeOption
                    key={option.value}
                    active={active}
                    onPress={() => setTheme(option.value)}
                  >
                    {React.cloneElement(option.icon, {
                      color: active ? colors.primary : colors.textSecondary,
                    })}
                    <Text
                      style={[
                        styles.themeLabel,
                        active && styles.themeLabelActive,
                        {
                          color: active ? colors.primary : colors.textSecondary,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </ThemeOption>
                );
              })}
            </View>
          </View>
        </View>
      </Card>

      <Card
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        elevation="md"
        padding={Spacing.lg}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.sectionIcon,
                { backgroundColor: colors.accent + '15' },
              ]}
            >
              <Smartphone
                size={IconSize.md}
                strokeWidth={2}
                color={colors.accent}
              />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t('settings.display')}
            </Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text
                style={[styles.settingTitle, { color: colors.textPrimary }]}
              >
                {t('settings.orientation')}
              </Text>
              <Text style={[styles.settingSub, { color: colors.textMuted }]}>
                {t('settings.orientationHint')}
              </Text>
            </View>
            <View style={styles.settingAction}>
              <Button
                title={
                  orientation === 'portrait'
                    ? t('settings.portrait')
                    : t('settings.landscape')
                }
                variant="outline"
                onPress={() =>
                  setOrientation(
                    orientation === 'portrait' ? 'landscape' : 'portrait'
                  )
                }
              />
            </View>
          </View>

          <View
            style={[
              styles.settingRow,
              {
                borderTopWidth: 1,
                borderTopColor: colors.border,
                paddingTop: Spacing.md,
              },
            ]}
          >
            <View style={styles.settingInfo}>
              <Text
                style={[styles.settingTitle, { color: colors.textPrimary }]}
              >
                {t('settings.keepAwake')}
              </Text>
              <Text style={[styles.settingSub, { color: colors.textMuted }]}>
                {t('settings.keepAwakeHint')}
              </Text>
            </View>
            <View style={styles.settingAction}>
              <Switch
                value={keepAwake}
                onValueChange={setKeepAwake}
                trackColor={{ false: colors.border, true: colors.success }}
                thumbColor={keepAwake ? colors.success : colors.textMuted}
              />
            </View>
          </View>

          <View
            style={[
              styles.settingRow,
              {
                borderTopWidth: 1,
                borderTopColor: colors.border,
                paddingTop: Spacing.md,
              },
            ]}
          >
            <View style={styles.settingInfo}>
              <Text
                style={[styles.settingTitle, { color: colors.textPrimary }]}
              >
                {t('settings.refreshRate')}
              </Text>
              <Text style={[styles.settingSub, { color: colors.textMuted }]}>
                {t('settings.refreshRateHint')}
              </Text>
            </View>
            <View style={styles.settingAction}>
              <Button
                title={
                  refreshRateOptions.find((o) => o.value === refreshRate)
                    ?.label || `${refreshRate}ms`
                }
                variant="outline"
                onPress={() => {
                  const currentIndex = refreshRateOptions.findIndex(
                    (o) => o.value === refreshRate
                  );
                  const nextIndex =
                    (currentIndex + 1) % refreshRateOptions.length;
                  const nextOption = refreshRateOptions[nextIndex];
                  if (nextOption) setRefreshRate(nextOption.value);
                }}
              />
            </View>
          </View>
        </View>
      </Card>

      <Card
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        elevation="md"
        padding={Spacing.lg}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.sectionIcon,
                { backgroundColor: colors.warning + '15' },
              ]}
            >
              <Shield
                size={IconSize.md}
                strokeWidth={2}
                color={colors.warning}
              />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t('settings.connection')}
            </Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text
                style={[styles.settingTitle, { color: colors.textPrimary }]}
              >
                {t('settings.autoReconnect')}
              </Text>
              <Text style={[styles.settingSub, { color: colors.textMuted }]}>
                {t('settings.autoReconnectHint')}
              </Text>
            </View>
            <View style={styles.settingAction}>
              <Badge variant="success">{t('settings.enabled')}</Badge>
            </View>
          </View>

          <View
            style={[
              styles.settingRow,
              {
                borderTopWidth: 1,
                borderTopColor: colors.border,
                paddingTop: Spacing.md,
              },
            ]}
          >
            <View style={styles.settingInfo}>
              <Text
                style={[styles.settingTitle, { color: colors.textPrimary }]}
              >
                {t('settings.pairingCode')}
              </Text>
              <Text style={[styles.settingSub, { color: colors.textMuted }]}>
                {t('settings.managePaired')}
              </Text>
            </View>
            <View style={styles.settingAction}>
              <Button
                title={t('settings.manage')}
                variant="ghost"
                onPress={() => {}}
                icon={
                  <ChevronRight
                    size={IconSize.sm}
                    strokeWidth={2}
                    color={colors.textSecondary}
                  />
                }
                iconPosition="end"
              />
            </View>
          </View>
        </View>
      </Card>

      <Card
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        elevation="sm"
        padding={Spacing.lg}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.sectionIcon,
                { backgroundColor: colors.textMuted + '15' },
              ]}
            >
              <Info
                size={IconSize.md}
                strokeWidth={2}
                color={colors.textMuted}
              />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t('settings.about')}
            </Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text
                style={[styles.settingTitle, { color: colors.textPrimary }]}
              >
                {t('settings.version')}
              </Text>
              <Text style={[styles.settingSub, { color: colors.textMuted }]}>
                {t('settings.versionHint')}
              </Text>
            </View>
            <View style={styles.settingAction}>
              <Text
                style={[styles.versionText, { color: colors.textSecondary }]}
              >
                0.1.0
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.settingRow,
              {
                borderTopWidth: 1,
                borderTopColor: colors.border,
                paddingTop: Spacing.md,
              },
            ]}
          >
            <View style={styles.settingInfo}>
              <Text
                style={[styles.settingTitle, { color: colors.textPrimary }]}
              >
                {t('settings.status')}
              </Text>
              <Text style={[styles.settingSub, { color: colors.textMuted }]}>
                {t('settings.statusHint')}
              </Text>
            </View>
            <View style={styles.settingAction}>
              <Badge variant="primary">{t('dashboard.mvp')}</Badge>
            </View>
          </View>

          <View
            style={[
              styles.settingRow,
              {
                borderTopWidth: 1,
                borderTopColor: colors.border,
                paddingTop: Spacing.md,
              },
            ]}
          >
            <View style={styles.settingInfo}>
              <Text
                style={[styles.settingTitle, { color: colors.textPrimary }]}
              >
                {t('settings.openSource')}
              </Text>
              <Text style={[styles.settingSub, { color: colors.textMuted }]}>
                {t('settings.openSourceHint')}
              </Text>
            </View>
            <View style={styles.settingAction}>
              <Button
                title={t('settings.github')}
                variant="ghost"
                onPress={() => {}}
                icon={
                  <ChevronRight
                    size={IconSize.sm}
                    strokeWidth={2}
                    color={colors.textSecondary}
                  />
                }
                iconPosition="end"
              />
            </View>
          </View>
        </View>
      </Card>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

function ThemeOption({
  active,
  onPress,
  children,
}: {
  active: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  const colors = useColors();
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.themeOptionBase,
        active
          ? {
              borderColor: colors.primary,
              backgroundColor: colors.primaryLight,
            }
          : {
              borderColor: colors.border,
              backgroundColor: colors.backgroundSecondary,
            },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${t('settings.themeMode')} ${active ? t('common.selected') : t('common.notSelected')}`}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {},
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl, gap: Spacing.lg },
  card: {
    borderRadius: BorderRadius.xxl,
    ...Shadows.md,
    borderWidth: 1,
  },
  section: { gap: Spacing.lg },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { ...Typography.h4, fontWeight: '700' },
  settingBlock: { gap: Spacing.md, paddingVertical: Spacing.md },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  settingInfo: { flex: 1 },
  settingTitle: { ...Typography.body, fontWeight: '600' },
  settingSub: { ...Typography.bodySmall, marginTop: 2 },
  settingAction: { marginLeft: Spacing.md, flexShrink: 1, minWidth: 0 },
  versionText: { ...Typography.mono, fontWeight: '600' },
  spacer: { height: Spacing.xxl },
  themeSelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  themeOptionBase: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  themeLabel: { ...Typography.caption, numberOfLines: 1 },
  themeLabelActive: {
    ...Typography.caption,
    fontWeight: '700',
    numberOfLines: 1,
  },
});
