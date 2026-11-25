import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import React from 'react';
import { useColors } from '@theme';
import { Header, Card } from '@components';
import { useApp } from '@context/AppContext';
import { useTranslation } from 'react-i18next';
import {
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
  Layout,
  IconSize,
} from '@design/tokens';
import {
  Plus,
  Eye,
  GripVertical,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Battery,
  PanelBottomClose,
  PanelBottomOpen,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NavigationProp } from '@react-navigation/native';
import { useBottomNavVisibility } from '@navigator/BottomNavVisibility';

type RootStackParamList = {
  Root: undefined;
  Connection: undefined;
  Settings: undefined;
  EditMode: undefined;
};

export function EditModeScreen({
  navigation,
}: {
  navigation?: NavigationProp<RootStackParamList>;
}) {
  const colors = useColors();
  const { t } = useTranslation();
  const { widgets, visible, onToggleWidget, setWidgets } = useApp();

  const insets = useSafeAreaInsets();
  const { isBottomNavVisible, toggleBottomNavVisibility } =
    useBottomNavVisibility();
  const contentBottomPadding = isBottomNavVisible
    ? Layout.tabBarHeight + Spacing.md + insets.bottom
    : Spacing.md + insets.bottom;

  interface WidgetDef {
    id: string;
    label: string;
    desc: string;
    icon: string;
  }

  const allWidgets: WidgetDef[] = [
    {
      id: 'clock',
      label: t('editMode.clock'),
      desc: t('editMode.clockDesc'),
      icon: 'clock',
    },
    {
      id: 'cpu',
      label: t('editMode.cpu'),
      desc: t('editMode.cpuDesc'),
      icon: 'cpu',
    },
    {
      id: 'ram',
      label: t('editMode.ram'),
      desc: t('editMode.ramDesc'),
      icon: 'memory',
    },
    {
      id: 'disk',
      label: t('editMode.disk'),
      desc: t('editMode.diskDesc'),
      icon: 'disk',
    },
    {
      id: 'network',
      label: t('editMode.network'),
      desc: t('editMode.networkDesc'),
      icon: 'network',
    },
    {
      id: 'battery',
      label: t('editMode.battery'),
      desc: t('editMode.batteryDesc'),
      icon: 'battery',
    },
  ];

  const getWidgetIcon = (id: string) => {
    switch (id) {
      case 'clock':
        return (
          <Eye size={IconSize.md} strokeWidth={2} color={colors.primary} />
        );
      case 'cpu':
        return (
          <Cpu size={IconSize.md} strokeWidth={2} color={colors.primary} />
        );
      case 'ram':
        return (
          <MemoryStick
            size={IconSize.md}
            strokeWidth={2}
            color={colors.primary}
          />
        );
      case 'disk':
        return (
          <HardDrive
            size={IconSize.md}
            strokeWidth={2}
            color={colors.primary}
          />
        );
      case 'network':
        return (
          <Network size={IconSize.md} strokeWidth={2} color={colors.primary} />
        );
      case 'battery':
        return (
          <Battery size={IconSize.md} strokeWidth={2} color={colors.primary} />
        );
      default:
        return (
          <Plus size={IconSize.md} strokeWidth={2} color={colors.primary} />
        );
    }
  };

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
        title={t('editMode.title')}
        subtitle={t('editMode.subtitle')}
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
              '[EditModeScreen] toggleBottomNavVisibility error',
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
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t('editMode.existingWidgets')}
            </Text>
            <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
              {t('editMode.dragHint')}
            </Text>
          </View>
          {widgets.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {t('editMode.empty')}
              </Text>
              <Text style={[styles.emptySub, { color: colors.textMuted }]}>
                {t('editMode.emptyHint')}
              </Text>
            </View>
          ) : (
            widgets.map((id: string) => {
              const widget = allWidgets.find((w) => w.id === id);
              if (!widget) return null;
              return (
                <View
                  key={id}
                  style={[
                    styles.widgetRow,
                    { borderBottomColor: colors.border },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.dragHandle}
                    onPress={() => {}}
                    accessibilityLabel={t('common.dragToReorder')}
                  >
                    <GripVertical
                      size={IconSize.md}
                      strokeWidth={2}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                  <View
                    style={[
                      styles.widgetIconWrapper,
                      { backgroundColor: colors.backgroundSecondary },
                    ]}
                  >
                    {getWidgetIcon(id)}
                  </View>
                  <View style={styles.widgetInfo}>
                    <Text
                      style={[styles.widgetName, { color: colors.textPrimary }]}
                    >
                      {widget.label}
                    </Text>
                    <Text
                      style={[styles.widgetSub, { color: colors.textMuted }]}
                    >
                      {widget.desc}
                    </Text>
                  </View>
                  <View style={styles.widgetActions}>
                    <Switch
                      value={visible[id] ?? true}
                      onValueChange={() => onToggleWidget(id)}
                      trackColor={{
                        false: colors.border,
                        true: colors.primary,
                      }}
                      thumbColor={
                        visible[id] ? colors.primary : colors.textMuted
                      }
                    />
                  </View>
                </View>
              );
            })
          )}
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
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {t('editMode.addNew')}
          </Text>
          <View style={styles.addWidgetGrid}>
            {allWidgets
              .filter((w) => !widgets.includes(w.id))
              .map((widget) => (
                <TouchableOpacity
                  key={widget.id}
                  style={[
                    styles.addWidgetCard,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                    },
                  ]}
                  onPress={() => {
                    setWidgets([...widgets, widget.id]);
                  }}
                >
                  <View
                    style={[
                      styles.addWidgetIcon,
                      { backgroundColor: colors.primary + '15' },
                    ]}
                  >
                    {getWidgetIcon(widget.id)}
                  </View>
                  <Text
                    style={[
                      styles.addWidgetLabel,
                      { color: colors.textPrimary },
                    ]}
                  >
                    {widget.label}
                  </Text>
                  <Text
                    style={[styles.addWidgetDesc, { color: colors.textMuted }]}
                  >
                    {widget.desc}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>
      </Card>

      <View style={styles.spacer} />
    </ScrollView>
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
    justifyContent: 'space-between',
  },
  sectionTitle: { ...Typography.h4, fontWeight: '700' },
  sectionHint: { ...Typography.caption },
  widgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  dragHandle: { padding: Spacing.sm },
  widgetIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  widgetInfo: { flex: 1 },
  widgetName: { ...Typography.body, fontWeight: '600' },
  widgetSub: { ...Typography.bodySmall, marginTop: 2 },
  widgetActions: { marginLeft: Spacing.sm },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyText: { ...Typography.h4, fontWeight: '600', marginBottom: Spacing.xs },
  emptySub: { ...Typography.bodySmall },
  addWidgetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'space-between',
  },
  addWidgetCard: {
    width: '48%',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  addWidgetIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addWidgetLabel: {
    ...Typography.body,
    fontWeight: '600',
    textAlign: 'center',
  },
  addWidgetDesc: { ...Typography.caption, textAlign: 'center' },
  spacer: { height: Spacing.xxl },
});
