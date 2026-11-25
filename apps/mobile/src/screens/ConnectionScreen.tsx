import { View, Text, StyleSheet, ScrollView } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Network from 'expo-network';
import { QrPairingPayloadSchema } from '@pocket-desk/protocol';
import { Header, Button, Input, Card, Badge } from '@components';
import { useColors } from '@theme';
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
  Wifi,
  QrCode,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
  Monitor,
  Link,
  Shield,
  PanelBottomClose,
  PanelBottomOpen,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomNavVisibility } from '@navigator/BottomNavVisibility';
import { useDebouncePress } from '@hooks/useDebouncePress';

export function ConnectionScreen() {
  const colors = useColors();
  const { t } = useTranslation();
  const { status, computerName, latency, lastSync, connect, disconnect } =
    useApp();
  const [endpoint, setEndpoint] = useState('ws://192.168.1.10:47831/ws');
  const [token, setToken] = useState('');
  const [scanning, setScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [ipAddress, setIpAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualConnecting, setManualConnecting] = useState(false);
  const hasScanned = useRef(false);
  const isUnmounted = useRef(false);
  const insets = useSafeAreaInsets();
  const { isBottomNavVisible, toggleBottomNavVisibility } =
    useBottomNavVisibility();
  const contentBottomPadding = isBottomNavVisible
    ? Layout.tabBarHeight + Spacing.md + insets.bottom
    : Spacing.md + insets.bottom;

  useEffect(() => {
    return () => {
      isUnmounted.current = true;
      setScanning(false);
    };
  }, []);

  const startScan = useCallback(async () => {
    setError(null);
    setCameraError(null);
    hasScanned.current = false;

    if (permission?.granted) {
      setScanning(true);
      return;
    }
    if (permission === undefined) {
      // First render: permission not yet resolved, request it
      const r = await requestPermission();
      if (!r.granted) {
        setCameraError(t('connection.permissionDenied'));
        return;
      }
      setScanning(true);
      return;
    }
    // Permission explicitly denied previously
    setCameraError(t('connection.permissionDeniedDetail'));
  }, [permission, requestPermission]);

  const handleScan = useCallback(
    (data: string) => {
      if (isUnmounted.current || hasScanned.current) return;
      if (!data) {
        setError(t('connection.invalidQr'));
        return;
      }
      hasScanned.current = true;

      setScanning(false);
      try {
        const parsed = JSON.parse(data);
        const res = QrPairingPayloadSchema.safeParse(parsed);
        if (!res.success) {
          setError(t('connection.invalidQr'));
          return;
        }
        const { host, port, token: pairingToken } = res.data;
        const ep = 'ws://' + host + ':' + port + '/ws';
        setEndpoint(ep);
        setToken(pairingToken);
        connect(ep, pairingToken);
      } catch {
        setError(t('connection.invalidQr'));
      }
    },
    [connect]
  );

  const debouncedConnect = useDebouncePress(() => {
    connect(endpoint, token);
  }, 1000);

  const handleConnect = useCallback(async () => {
    setError(null);
    setManualConnecting(true);
    debouncedConnect();
    setTimeout(() => setManualConnecting(false), 3000);
  }, [endpoint, token, debouncedConnect]);

  useEffect(() => {
    Network.getIpAddressAsync()
      .then((ipAddress: string) => setIpAddress(ipAddress))
      .catch((err) => {
        console.error('[ConnectionScreen] Failed to get IP address', err);
      });
  }, []);

  if (scanning) {
    if (permission?.granted !== true) {
      const denied = permission?.status === 'denied';
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
            title={t('connection.scanTitle')}
            subtitle={
              denied
                ? t('connection.permissionDenied')
                : t('connection.requestingPermission')
            }
            onBack={() => setScanning(false)}
            translucent={true}
          />
          <View style={styles.permissionCenter}>
            <Text
              style={[styles.permissionText, { color: colors.textSecondary }]}
            >
              {denied
                ? t('connection.grantPermission')
                : t('connection.waitingPermission')}
            </Text>
          </View>
          {denied ? (
            <View style={styles.cancelButton}>
              <Button
                variant="ghost"
                title={t('connection.retry')}
                onPress={startScan}
                fullWidth
              />
              <Button
                variant="outline"
                title={t('common.cancel')}
                onPress={() => setScanning(false)}
                fullWidth
              />
            </View>
          ) : (
            <View style={styles.cancelButton}>
              <Button
                variant="ghost"
                title={t('common.cancel')}
                onPress={() => setScanning(false)}
                fullWidth
              />
            </View>
          )}
        </ScrollView>
      );
    }

    return (
      <View style={styles.scannerContainer}>
        <Header
          title={t('connection.scanTitle')}
          subtitle={t('connection.scanSubtitle')}
          onBack={() => setScanning(false)}
          translucent={true}
        />
        <CameraView
          style={styles.camera}
          onBarcodeScanned={(r: { data: string }) => handleScan(r.data)}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        />
        <View style={styles.cancelButton}>
          <Button
            variant="ghost"
            title={t('common.cancel')}
            onPress={() => setScanning(false)}
            fullWidth
          />
        </View>
      </View>
    );
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'paired':
        return {
          color: colors.success,
          icon: CheckCircle,
          label: t('connection.paired'),
          bg: colors.success + '15',
        };
      case 'connected':
        return {
          color: colors.warning,
          icon: Wifi,
          label: t('connection.connected'),
          bg: colors.warning + '15',
        };
      case 'connecting':
        return {
          color: colors.primary,
          icon: Loader,
          label: t('connection.connecting'),
          bg: colors.primary + '15',
          animated: true,
        };
      default:
        return {
          color: colors.error,
          icon: XCircle,
          label: t('connection.disconnected'),
          bg: colors.error + '15',
        };
    }
  };

  const statusConfig = getStatusConfig();

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
        title={t('connection.connectTitle')}
        subtitle={t('connection.connectSubtitle')}
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
              '[ConnectionScreen] toggleBottomNavVisibility error',
              err
            );
          }
        }}
        rightAccessibilityLabel={
          isBottomNavVisible ? t('nav.hideNavigation') : t('nav.showNavigation')
        }
        translucent={true}
      />

      <Card
        style={[
          styles.statusCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        elevation="md"
        padding={Spacing.xl}
      >
        <View style={styles.statusCenter}>
          <View
            style={[
              styles.statusRing,
              {
                borderColor: statusConfig.color,
                backgroundColor: statusConfig.bg,
              },
            ]}
          >
            {statusConfig.animated ? (
              <Loader size={24} strokeWidth={3} color={statusConfig.color} />
            ) : (
              <statusConfig.icon
                size={IconSize.xl}
                strokeWidth={2.5}
                color={statusConfig.color}
              />
            )}
          </View>
          <Text style={[styles.statusTitle, { color: colors.textPrimary }]}>
            {statusConfig.label}
          </Text>
          {computerName && (
            <Text style={[styles.statusSub, { color: colors.textSecondary }]}>
              {computerName}
            </Text>
          )}
        </View>

        {(latency !== null || lastSync) && (
          <View style={[styles.statusMeta, { borderTopColor: colors.border }]}>
            {latency !== null && (
              <View style={styles.metaItem}>
                <Text
                  style={[styles.metaLabel, { color: colors.textSecondary }]}
                >
                  {t('connection.latency')}
                </Text>
                <Text style={[styles.metaValue, { color: colors.textPrimary }]}>
                  {latency}ms
                </Text>
              </View>
            )}
            {lastSync && (
              <View style={styles.metaItem}>
                <Text
                  style={[styles.metaLabel, { color: colors.textSecondary }]}
                >
                  {t('connection.lastSync')}
                </Text>
                <Text style={[styles.metaValue, { color: colors.textPrimary }]}>
                  {lastSync}
                </Text>
              </View>
            )}
          </View>
        )}
      </Card>

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
              {t('connection.scanQr')}
            </Text>
            <Badge variant="primary">{t('connection.recommended')}</Badge>
          </View>
          <View style={styles.scanRow}>
            <View
              style={[
                styles.scanIcon,
                { backgroundColor: colors.primary + '15' },
              ]}
            >
              <QrCode
                size={IconSize.lg}
                strokeWidth={2}
                color={colors.primary}
              />
            </View>
            <View style={styles.scanText}>
              <Text style={[styles.scanLabel, { color: colors.textPrimary }]}>
                {t('connection.scanQrFromComputer')}
              </Text>
              <Text style={[styles.scanSub, { color: colors.textSecondary }]}>
                {t('connection.fastestPairing')}
              </Text>
            </View>
          </View>
          <Button
            title={t('connection.scanQrAction')}
            variant="outline"
            onPress={startScan}
            fullWidth
            icon={
              <QrCode
                size={IconSize.md}
                strokeWidth={2}
                color={colors.primary}
              />
            }
          />
          {cameraError && (
            <View
              style={[
                styles.cameraErrorBanner,
                {
                  backgroundColor: colors.error + '10',
                  borderColor: colors.error + '30',
                },
              ]}
            >
              <Text style={[styles.cameraErrorText, { color: colors.error }]}>
                {cameraError}
              </Text>
            </View>
          )}
        </View>
      </Card>

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
              {t('connection.manualConnect')}
            </Text>
            <Badge variant="outline">{t('connection.optional')}</Badge>
          </View>
          <Input
            value={endpoint}
            onChangeText={setEndpoint}
            placeholder={t('connection.endpointPlaceholder')}
            label={t('connection.endpointLabel')}
            leftIcon={
              <Link
                size={IconSize.md}
                strokeWidth={2}
                color={colors.textMuted}
              />
            }
          />
          <Input
            value={token}
            onChangeText={setToken}
            placeholder={t('connection.pairingCodePlaceholder')}
            label={t('connection.pairingCodeLabel')}
            leftIcon={
              <Shield
                size={IconSize.md}
                strokeWidth={2}
                color={colors.textMuted}
              />
            }
          />
          <Button
            title={
              status === 'connected' || status === 'paired'
                ? t('connection.disconnect')
                : manualConnecting
                  ? t('connection.connectingAction')
                  : t('connection.connect')
            }
            onPress={
              status === 'connected' || status === 'paired'
                ? disconnect
                : handleConnect
            }
            fullWidth
            variant={
              status === 'connected' || status === 'paired'
                ? 'danger'
                : 'primary'
            }
            loading={manualConnecting}
            disabled={status === 'connecting'}
          />
        </View>
      </Card>

      {ipAddress && (
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
              {t('connection.deviceInfo')}
            </Text>
            <View style={styles.infoRow}>
              <View
                style={[
                  styles.infoIcon,
                  { backgroundColor: colors.backgroundSecondary },
                ]}
              >
                <Wifi
                  size={IconSize.md}
                  strokeWidth={2}
                  color={colors.primary}
                />
              </View>
              <View style={styles.infoText}>
                <Text
                  style={[styles.infoLabel, { color: colors.textSecondary }]}
                >
                  {t('connection.localIp')}
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    { color: colors.textPrimary, fontFamily: 'monospace' },
                  ]}
                >
                  {ipAddress}
                </Text>
              </View>
            </View>
            <View style={[styles.infoRow, { marginTop: Spacing.md }]}>
              <View
                style={[
                  styles.infoIcon,
                  { backgroundColor: colors.backgroundSecondary },
                ]}
              >
                <Monitor
                  size={IconSize.md}
                  strokeWidth={2}
                  color={colors.accent}
                />
              </View>
              <View style={styles.infoText}>
                <Text
                  style={[styles.infoLabel, { color: colors.textSecondary }]}
                >
                  {t('connection.wsPort')}
                </Text>
                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                  47831
                </Text>
              </View>
            </View>
          </View>
        </Card>
      )}

      {error && (
        <View
          style={[
            styles.errorBanner,
            {
              backgroundColor: colors.error + '10',
              borderColor: colors.error + '30',
            },
          ]}
        >
          <View
            style={[styles.errorIcon, { backgroundColor: colors.error + '15' }]}
          >
            <AlertCircle
              size={IconSize.md}
              strokeWidth={2}
              color={colors.error}
            />
          </View>
          <Text style={[styles.errorText, { color: colors.textPrimary }]}>
            {error}
          </Text>
        </View>
      )}

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl, gap: Spacing.lg },
  scannerContainer: { flex: 1 },
  camera: { flex: 1 },
  cancelButton: {
    position: 'absolute',
    bottom: 24 + Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
  },
  permissionCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  permissionText: { ...Typography.body, textAlign: 'center' },
  cameraErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  cameraErrorText: { ...Typography.bodySmall, flex: 1 },
  statusCard: {
    borderRadius: BorderRadius.xxl,
    alignItems: 'center',
    ...Shadows.lg,
    borderWidth: 1,
  },
  statusCenter: { alignItems: 'center' },
  statusRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  statusTitle: { ...Typography.h2, fontWeight: '700', textAlign: 'center' },
  statusSub: { ...Typography.body, marginTop: Spacing.xs, textAlign: 'center' },
  statusMeta: {
    flexDirection: 'row',
    gap: Spacing.xl,
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    width: '100%',
    justifyContent: 'center',
  },
  metaItem: { alignItems: 'center' },
  metaLabel: { ...Typography.caption },
  metaValue: { ...Typography.mono, fontWeight: '600' },
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
  scanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  scanIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanText: { flex: 1 },
  scanLabel: { ...Typography.body, fontWeight: '600' },
  scanSub: { ...Typography.bodySmall, marginTop: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: { flex: 1 },
  infoLabel: { ...Typography.caption },
  infoValue: { ...Typography.bodySmall, fontWeight: '600' },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
  },
  errorIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: { ...Typography.bodySmall, flex: 1 },
  spacer: { height: Spacing.xxl },
});
