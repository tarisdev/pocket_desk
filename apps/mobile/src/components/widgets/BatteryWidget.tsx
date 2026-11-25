import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { Battery, BatteryCharging, BatteryLow } from 'lucide-react-native';
import { useColors } from '@theme';
import { useTranslation } from 'react-i18next';
import { Spacing, BorderRadius, Typography, IconSize } from '@design/tokens';
import { WidgetCard } from '@components/widgets/WidgetCard';

interface BatteryWidgetProps {
  percent: number | null;
  charging?: boolean | null;
  testID?: string;
  width?: number;
}

export function BatteryWidget({
  percent,
  charging = false,
  testID,
  width,
}: BatteryWidgetProps) {
  const colors = useColors();
  const { t } = useTranslation();
  const display = percent === null ? '--' : percent.toFixed(0);
  const isCharging = charging === true;
  const isLow = percent !== null && percent < 20 && !isCharging;
  const color =
    percent === null
      ? colors.textMuted
      : isCharging
        ? colors.success
        : isLow
          ? colors.error
          : colors.primary;

  let BatteryIcon = Battery;
  if (isCharging) BatteryIcon = BatteryCharging;
  else if (isLow) BatteryIcon = BatteryLow;

  const barWidth = percent === null ? 0 : Math.max(0, Math.min(100, percent));

  return (
    <WidgetCard
      title={t('widgets.battery')}
      subtitle={t('widgets.batterySubtitle')}
      accentColor={color}
      style={{ width, minWidth: 140 }}
      testID={testID}
      loading={percent === null}
    >
      <View style={styles.batteryContent}>
        <View style={styles.iconWrapper}>
          <BatteryIcon size={IconSize.sm} strokeWidth={2} color={color} />
        </View>
        <View style={styles.valueWrapper}>
          <Text style={[styles.value, { color }]}>
            {display}
            <Text style={[styles.unit, { color }]}>%</Text>
          </Text>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {isCharging
              ? t('widgets.charging')
              : percent === null
                ? t('widgets.noData')
                : isLow
                  ? t('widgets.lowBattery')
                  : t('widgets.available')}
          </Text>
        </View>
        <View style={styles.barContainer}>
          <View
            style={[
              styles.barTrack,
              { backgroundColor: colors.backgroundSecondary },
            ]}
          />
          <View
            style={[
              styles.barFill,
              { width: `${barWidth}%`, backgroundColor: color },
            ]}
          />
        </View>
      </View>
    </WidgetCard>
  );
}

const styles = StyleSheet.create({
  batteryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconWrapper: {
    width: 26,
    height: 26,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueWrapper: { flex: 1 },
  value: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'monospace',
    flexShrink: 1,
  },
  unit: { fontSize: 12, fontWeight: '600' },
  label: { ...Typography.caption },
  barContainer: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: Spacing.xs,
    width: '100%',
  },
  barTrack: { height: 4, borderRadius: 2 },
  barFill: { height: 4, borderRadius: 2 },
});
