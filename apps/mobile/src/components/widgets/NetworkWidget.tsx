import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react-native';
import { useColors } from '@theme';
import { useTranslation } from 'react-i18next';
import { Spacing, BorderRadius, IconSize } from '@design/tokens';
import { WidgetCard } from '@components/widgets/WidgetCard';

interface NetworkWidgetProps {
  up: number | null;
  down: number | null;
  testID?: string;
  width?: number;
}

export function NetworkWidget({ up, down, testID, width }: NetworkWidgetProps) {
  const colors = useColors();
  const { t } = useTranslation();
  const connected = up !== null && down !== null;
  const upRate = up === null ? { value: '--', unit: '' } : formatBytes(up);
  const downRate =
    down === null ? { value: '--', unit: '' } : formatBytes(down);

  return (
    <WidgetCard
      title={t('widgets.network')}
      subtitle={t('widgets.networkSubtitle')}
      accentColor={colors.accent}
      style={{ width, minWidth: 140 }}
      testID={testID}
      loading={!connected}
    >
      <View style={styles.networkContent}>
        <View style={styles.rateRow}>
          <View style={styles.rateLeft}>
            <View
              style={[
                styles.rateIcon,
                { backgroundColor: colors.backgroundSecondary },
              ]}
            >
              <ArrowUp
                size={IconSize.sm}
                strokeWidth={2}
                color={colors.success}
              />
            </View>
            <Text style={[styles.rateLabel, { color: colors.textSecondary }]}>
              {t('common.upload')}
            </Text>
          </View>
          <Text style={[styles.rateValue, { color: colors.textPrimary }]}>
            {upRate.value} {upRate.unit}
          </Text>
        </View>
        <View
          style={[styles.rowSeparator, { backgroundColor: colors.border }]}
        />
        <View style={styles.rateRow}>
          <View style={styles.rateLeft}>
            <View
              style={[
                styles.rateIcon,
                { backgroundColor: colors.backgroundSecondary },
              ]}
            >
              <ArrowDown
                size={IconSize.sm}
                strokeWidth={2}
                color={colors.error}
              />
            </View>
            <Text style={[styles.rateLabel, { color: colors.textSecondary }]}>
              {t('common.download')}
            </Text>
          </View>
          <Text style={[styles.rateValue, { color: colors.textPrimary }]}>
            {downRate.value} {downRate.unit}
          </Text>
        </View>
      </View>
    </WidgetCard>
  );
}

function formatBytes(bytes: number): { value: string; unit: string } {
  if (bytes < 1024) return { value: bytes.toFixed(0), unit: 'B/s' };
  if (bytes < 1024 * 1024)
    return { value: (bytes / 1024).toFixed(1), unit: 'KB/s' };
  return { value: (bytes / (1024 * 1024)).toFixed(1), unit: 'MB/s' };
}

const styles = StyleSheet.create({
  networkContent: { gap: Spacing.xs },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  rateLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  rateIcon: {
    width: 26,
    height: 26,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateLabel: { fontSize: 11, fontWeight: '600' },
  rateValue: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'monospace',
    flexShrink: 1,
  },
  rowSeparator: { height: 1 },
});
