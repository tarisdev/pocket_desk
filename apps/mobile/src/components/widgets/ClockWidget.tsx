import { View, Text, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Clock, Calendar } from 'lucide-react-native';
import { useColors } from '@theme';
import { useTranslation } from 'react-i18next';
import { Spacing, BorderRadius, Typography, IconSize } from '@design/tokens';
import { WidgetCard } from '@components/widgets/WidgetCard';

interface ClockWidgetProps {
  width?: number;
}

export function ClockWidget({ width }: ClockWidgetProps) {
  const colors = useColors();
  const { t, i18n } = useTranslation();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const locale = i18n.language === 'vi' ? 'vi-VN' : 'en-US';
  const time = now.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: locale === 'en-US',
  });
  const date = now.toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <WidgetCard
      title={t('widgets.clock')}
      subtitle={t('widgets.clockSubtitle')}
      accentColor={colors.primary}
      style={{ width, minWidth: 140 }}
    >
      <View style={styles.clockContent}>
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: colors.primary + '15' },
          ]}
        >
          <Clock size={IconSize.md} strokeWidth={2} color={colors.primary} />
        </View>
        <View style={styles.timeWrapper}>
          <Text style={[styles.time, { color: colors.textPrimary }]}>
            {time}
          </Text>
          <View style={styles.dateRow}>
            <Calendar
              size={IconSize.xs}
              strokeWidth={1.5}
              color={colors.textMuted}
            />
            <Text style={[styles.date, { color: colors.textSecondary }]}>
              {date}
            </Text>
          </View>
        </View>
      </View>
    </WidgetCard>
  );
}

const styles = StyleSheet.create({
  clockContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeWrapper: { flex: 1 },
  time: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
    fontFamily: 'monospace',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  date: { ...Typography.caption, marginLeft: Spacing.xs },
});
