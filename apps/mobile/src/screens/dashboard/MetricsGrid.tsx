import { View, StyleSheet } from 'react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  MetricWidget,
  NetworkWidget,
  BatteryWidget,
  ErrorBoundary,
} from '@components';
import { Spacing } from '@design/tokens';

interface MetricsGridProps {
  cpu: number | null;
  ram: number | null;
  disk: number | null;
  up: number | null;
  down: number | null;
  battery: number | null;
  charging: boolean | null;
  cardWidth: number;
}

export function MetricsGrid({
  cpu,
  ram,
  disk,
  up,
  down,
  battery,
  charging,
  cardWidth,
}: MetricsGridProps) {
  const { t } = useTranslation();

  return (
    <View style={[styles.grid, { gap: Spacing.md }]}>
      <ErrorBoundary fallback="CPU widget lỗi">
        <MetricWidget
          label={t('dashboard.cpu')}
          value={cpu}
          unit="%"
          color="#6366f1"
          subtitle={t('dashboard.cpuSubtitle')}
          trend={cpu !== null && cpu > 70 ? 'up' : 'neutral'}
          trendValue={cpu !== null ? cpu - 65 : 0}
          width={cardWidth}
        />
      </ErrorBoundary>
      <ErrorBoundary fallback="RAM widget lỗi">
        <MetricWidget
          label={t('dashboard.ram')}
          value={ram}
          unit="%"
          color="#ec4899"
          subtitle={t('dashboard.ramSubtitle')}
          trend={ram !== null && ram > 80 ? 'up' : 'neutral'}
          trendValue={ram !== null ? ram - 75 : 0}
          width={cardWidth}
        />
      </ErrorBoundary>
      <ErrorBoundary fallback="Disk widget lỗi">
        <MetricWidget
          label={t('dashboard.disk')}
          value={disk}
          unit="%"
          color="#f59e0b"
          subtitle={t('dashboard.diskSubtitle')}
          trend={disk !== null && disk > 85 ? 'up' : 'neutral'}
          trendValue={disk !== null ? disk - 80 : 0}
          width={cardWidth}
        />
      </ErrorBoundary>
      <ErrorBoundary fallback="Network widget lỗi">
        <NetworkWidget up={up} down={down} width={cardWidth} />
      </ErrorBoundary>
      <ErrorBoundary fallback="Battery widget lỗi">
        <BatteryWidget
          percent={battery}
          charging={charging}
          width={cardWidth}
        />
      </ErrorBoundary>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
