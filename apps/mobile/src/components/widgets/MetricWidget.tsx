import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { useColors } from '@theme';
import { Spacing } from '@design/tokens';
import { WidgetCard } from '@components/widgets/WidgetCard';

interface MetricWidgetProps {
  value: number | null;
  label: string;
  unit: string;
  color: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  testID?: string;
  width?: number;
}

export function MetricWidget({
  value,
  label,
  unit = '%',
  color,
  subtitle,
  trend = 'neutral',
  trendValue,
  testID,
  width,
}: MetricWidgetProps) {
  const colors = useColors();
  const numericValue = value ?? null;
  const displayValue = numericValue === null ? '--' : numericValue.toFixed(1);
  const barWidth =
    numericValue === null ? 0 : Math.max(0, Math.min(100, numericValue));
  const isLoading = numericValue === null;

  const trendColors = {
    up: colors.success,
    down: colors.error,
    neutral: colors.textMuted,
  };

  return (
    <WidgetCard
      title={label}
      subtitle={subtitle}
      accentColor={color}
      style={{ width, minWidth: 140 }}
      testID={testID}
      loading={isLoading}
    >
      <View style={styles.metricContent}>
        <View style={styles.valueWrapper}>
          <Text
            style={[
              styles.value,
              { color: isLoading ? colors.textMuted : color },
            ]}
          >
            {displayValue}
            <Text style={[styles.unit, { color: colors.textMuted }]}>
               {unit}
            </Text>
          </Text>
        </View>
        {trendValue !== undefined && (
          <View style={styles.trendRow}>
            <Text style={[styles.trend, { color: trendColors[trend] }]}>
              {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '●'}
            </Text>
            <Text style={[styles.trendValue, { color: trendColors[trend] }]}>
              {Math.abs(trendValue).toFixed(1)}%
            </Text>
          </View>
        )}
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
  metricContent: { gap: Spacing.sm },
  valueWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
    fontFamily: 'monospace',
  },
  unit: { fontSize: 11, fontWeight: '600' },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  trend: { fontSize: 10, fontWeight: '700' },
  trendValue: { fontSize: 10, fontWeight: '600' },
  barContainer: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: Spacing.xs,
  },
  barTrack: { height: 4, borderRadius: 2 },
  barFill: { height: 4, borderRadius: 2 },
});
