import {
  View,
  Text,
  StyleSheet,
  Button as RNButton,
  Pressable,
} from 'react-native';
import React, { Component, type ReactNode, type ErrorInfo } from 'react';
import { ThemeContext } from '@design/theme';
import { Spacing, BorderRadius, Typography, IconSize } from '@design/tokens';
import { AlertCircle } from 'lucide-react-native';
import i18n from '@i18n';
import { useTranslation } from 'react-i18next';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  testID?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { children, fallback, testID } = this.props;
    const t = (key: string) => i18n.t(key);

    return (
      <ThemeContext.Consumer>
        {(ctx: { colors?: Record<string, string> } | undefined) => {
          const colors = ctx?.colors ?? {
            error: '#ef4444',
            surface: '#ffffff',
            textSecondary: '#64748b',
            primary: '#6366f1',
            textPrimary: '#0f172a',
          };
          if (this.state.hasError) {
            const err = this.state.error;
            return (
              <Pressable
                style={[
                  styles.container,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.error,
                    borderWidth: 1,
                  },
                ]}
                onPress={this.reset}
                testID={testID}
                accessibilityRole="button"
                accessibilityLabel={t('errors.tapToRetry')}
              >
                <View style={styles.content}>
                  <AlertCircle
                    size={IconSize.xl}
                    strokeWidth={2.5}
                    color={colors.error}
                  />
                  <View style={styles.textWrapper}>
                    <Text style={[styles.title, { color: colors.error }]}>
                      {t('errors.screenError')}
                    </Text>
                    {fallback ? (
                      <Text
                        style={[
                          styles.message,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {String(fallback)}
                      </Text>
                    ) : (
                      <Text
                        style={[
                          styles.message,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {err?.message ?? t('errors.cannotDisplay')}
                      </Text>
                    )}
                  </View>
                  <RNButton
                    title={t('common.retry')}
                    color={colors.primary}
                    onPress={this.reset}
                  />
                </View>
              </Pressable>
            );
          }

          return children;
        }}
      </ThemeContext.Consumer>
    );
  }
}

interface ErrorFallbackProps {
  title: string;
  message: string;
  onRetry: () => void;
}

function ErrorFallback({ title, message, onRetry }: ErrorFallbackProps) {
  const colors = useColors();
  const { t } = useTranslation();

  return (
    <View style={styles.fallbackContainer}>
      <AlertCircle size={IconSize.xl} strokeWidth={2.5} color={colors.error} />
      <Text style={[styles.fallbackTitle, { color: colors.error }]}>
        {title}
      </Text>
      <Text style={[styles.fallbackMessage, { color: colors.textSecondary }]}>
        {message}
      </Text>
      <Pressable
        style={styles.retryButton}
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel={t('common.retry')}
      >
        <Text style={[styles.retryText, { color: colors.primary }]}>
          {t('common.retry')}
        </Text>
      </Pressable>
    </View>
  );
}

function useColors() {
  const ctx = React.useContext(ThemeContext) as
    { colors?: Record<string, string> } | undefined;
  return (ctx?.colors ?? {
    error: '#ef4444',
    surface: '#ffffff',
    textSecondary: '#64748b',
    primary: '#6366f1',
    textPrimary: '#0f172a',
  }) as Record<string, string>;
}

export { ErrorBoundary as default };
export { ErrorFallback };

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.lg,
  },
  content: { alignItems: 'center', gap: Spacing.md },
  title: { ...Typography.h4, fontWeight: '700', textAlign: 'center' },
  message: {
    ...Typography.body,
    textAlign: 'center',
    marginHorizontal: Spacing.sm,
  },
  textWrapper: { alignItems: 'center', gap: Spacing.sm },
  fallbackContainer: {
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  fallbackTitle: { ...Typography.h4, fontWeight: '700', textAlign: 'center' },
  fallbackMessage: {
    ...Typography.body,
    textAlign: 'center',
    marginHorizontal: Spacing.sm,
  },
  retryButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  retryText: { ...Typography.button, fontWeight: '700' },
});
