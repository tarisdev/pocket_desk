import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useColors } from '@theme';
import { Spacing, BorderRadius, Typography } from '@design/tokens';

interface ConnectionCardProps {
  status: 'disconnected' | 'connecting' | 'connected' | 'paired';
  statusLabel: string;
  computerName: string | null;
  latency: number | null;
  lastSync: string | null;
}

export function ConnectionCard({
  status,
  statusLabel,
  computerName,
  latency,
  lastSync,
}: ConnectionCardProps) {
  const colors = useColors();
  const { t } = useTranslation();

  return (
    <View
      style={[
        styles.connectionCard,
        { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
      ]}
    >
      <View style={styles.connectionHeader}>
        <View
          style={[
            styles.statusIndicator,
            {
              backgroundColor:
                status === 'paired'
                  ? colors.success
                  : status === 'connected'
                    ? colors.warning
                    : colors.error,
            },
          ]}
        />
        <View style={styles.connectionInfo}>
          <Text style={[styles.connectionTitle, { color: colors.textPrimary }]}>
            {statusLabel}
          </Text>
          {computerName && (
            <Text
              style={[styles.connectionSub, { color: colors.textSecondary }]}
            >
              {computerName}
            </Text>
          )}
        </View>
      </View>
      {latency !== null && (
        <View style={[styles.latencyRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.latencyLabel, { color: colors.textMuted }]}>
            {t('dashboard.latency')}
          </Text>
          <Text
            style={[
              styles.latencyValue,
              { color: colors.textPrimary, fontFamily: 'monospace' },
            ]}
          >
            {latency}ms
          </Text>
        </View>
      )}
      {lastSync && (
        <View style={[styles.latencyRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.latencyLabel, { color: colors.textMuted }]}>
            {t('dashboard.lastSync')}
          </Text>
          <Text style={[styles.latencyValue, { color: colors.textPrimary }]}>
            {lastSync}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  connectionCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    width: '100%',
  },
  connectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  statusIndicator: { width: 8, height: 8, borderRadius: 4 },
  connectionInfo: { flex: 1 },
  connectionTitle: { ...Typography.label, fontWeight: '700' },
  connectionSub: { ...Typography.caption, marginTop: 1 },
  latencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  latencyLabel: { ...Typography.caption },
  latencyValue: { ...Typography.caption, fontWeight: '700' },
});
