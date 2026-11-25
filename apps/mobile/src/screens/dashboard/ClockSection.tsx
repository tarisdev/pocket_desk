import { View, StyleSheet } from 'react-native';
import React from 'react';
import { ClockWidget, ErrorBoundary } from '@components';
import { Spacing } from '@design/tokens';

interface ClockSectionProps {
  width: number;
}

export function ClockSection({ width }: ClockSectionProps) {
  return (
    <View style={styles.section}>
      <ErrorBoundary fallback="Clock widget lỗi">
        <ClockWidget width={width} />
      </ErrorBoundary>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: Spacing.md },
});
