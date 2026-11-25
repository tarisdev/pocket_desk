import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StreamDeckButton, Badge, Button } from '@components';
import { Spacing, Typography } from '@design/tokens';

interface StreamDeckSectionProps {
  buttonSize: number;
  onButtonPress: (actionId: string) => void;
  onAddWidgetPress: () => void;
}

export function StreamDeckSection({
  buttonSize,
  onButtonPress,
  onAddWidgetPress,
}: StreamDeckSectionProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: 'inherit' }]}>
          {t('dashboard.streamDeck')}
        </Text>
        <Badge variant="primary">{t('dashboard.mvp')}</Badge>
      </View>
      <View style={styles.streamDeckGrid}>
        <StreamDeckButton
          label={t('dashboard.browser')}
          color="#10b981"
          onPress={() => onButtonPress('open-browser')}
          size={buttonSize}
        />
        <StreamDeckButton
          label={t('dashboard.code')}
          color="#3b82f6"
          onPress={() => onButtonPress('open-editor')}
          size={buttonSize}
        />
        <StreamDeckButton
          label={t('dashboard.terminal')}
          color="#8b5cf6"
          onPress={() => onButtonPress('open-terminal')}
          size={buttonSize}
        />
        <StreamDeckButton
          label={t('settings.title')}
          color="#f59e0b"
          onPress={() => onButtonPress('open-settings')}
          size={buttonSize}
        />
      </View>
      <View style={styles.addWidgetSection}>
        <Button
          title={t('dashboard.addWidgets')}
          variant="outline"
          onPress={onAddWidgetPress}
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: Spacing.md },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sectionTitle: { ...Typography.label, fontWeight: '700', letterSpacing: 0.4 },
  streamDeckGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  addWidgetSection: {
    marginTop: Spacing.md,
  },
});
