import {
  View,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  RefreshControl,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { type NavigationProp, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@theme';
import Animated from 'react-native-reanimated';
import { useBottomNavVisibility } from '@navigator/BottomNavVisibility';
import { useTranslation } from 'react-i18next';
import { useDebouncePress } from '../hooks/useDebouncePress';
import { Spacing, Layout, Animation } from '@design/tokens';
import { useStaggeredFadeIn } from '@design/animations';
import { useApp } from '@context/AppContext';
import { ErrorBoundary, ClockWidget } from '@components';

import { TopBar } from './dashboard/TopBar';
import { MetricsGrid } from './dashboard/MetricsGrid';
import { ConnectionCard } from './dashboard/ConnectionCard';
import { StreamDeckSection } from './dashboard/StreamDeckSection';

type DashboardNavigation = NavigationProp<{
  Root: undefined;
  Connection: undefined;
  Settings: undefined;
  EditMode: undefined;
}>;
type DashboardRoute = RouteProp<
  {
    Root: undefined;
    Connection: undefined;
    Settings: undefined;
    EditMode: undefined;
  },
  'Root'
>;

interface DashboardScreenProps {
  navigation?: DashboardNavigation;
  route?: DashboardRoute;
}

const SCREEN_PADDING = Spacing.md;
const GRID_GAP = Spacing.md;
const CARD_MIN_WIDTH = 140;

export function DashboardScreen({ navigation }: DashboardScreenProps) {
  const colors = useColors();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const {
    cpu,
    ram,
    disk,
    up,
    down,
    battery,
    charging,
    status,
    computerName,
    latency,
    lastSync,
    onStreamDeckPress,
  } = useApp();

  const { getAnimatedStyle, start: startStagger } = useStaggeredFadeIn(
    5,
    60,
    Animation.duration.normal
  );

  useEffect(() => {
    startStagger();
  }, [startStagger]);

  const { isBottomNavVisible, toggleBottomNavVisibility } =
    useBottomNavVisibility();
  const contentBottomPadding = isBottomNavVisible
    ? Layout.tabBarHeight + Spacing.md + insets.bottom
    : Spacing.md + insets.bottom;
  const screenPaddingLeft = SCREEN_PADDING + insets.left;
  const screenPaddingRight = SCREEN_PADDING + insets.right;

  const isTwoColumn = width >= 340;
  const usableWidth = width - insets.left - insets.right;
  const cardWidth = isTwoColumn
    ? Math.max(
        CARD_MIN_WIDTH,
        (usableWidth - SCREEN_PADDING * 2 - GRID_GAP) / 2
      )
    : usableWidth - SCREEN_PADDING * 2;

  const buttonSize = Math.max(
    44,
    (usableWidth - SCREEN_PADDING * 2 - GRID_GAP * 3) / 4
  );

  const statusLabel =
    status === 'paired'
      ? t('dashboard.status.paired')
      : status === 'connected'
        ? t('dashboard.status.connected')
        : status === 'connecting'
          ? t('dashboard.status.connecting')
          : t('dashboard.status.disconnected');

  const [refreshing, setRefreshing] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
    } finally {
      if (isMountedRef.current) {
        setRefreshing(false);
      }
    }
  }, []);

  const handleEditPress = useCallback(() => {
    navigation?.navigate('EditMode');
  }, [navigation]);

  const handleAddWidgetPress = useCallback(() => {
    navigation?.navigate('EditMode');
  }, [navigation]);

  const debouncedStreamDeck = useDebouncePress((actionId: string) => {
    onStreamDeckPress(actionId);
  }, 500);

  return (
    <ScrollView
      style={[
        { flex: 1, backgroundColor: colors.background },
        styles.container,
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          progressBackgroundColor={colors.backgroundSecondary}
        />
      }
      contentContainerStyle={[
        styles.content,
        { paddingBottom: contentBottomPadding },
      ]}
    >
      <TopBar
        status={status}
        statusLabel={statusLabel}
        isBottomNavVisible={isBottomNavVisible}
        onToggleBottomNav={toggleBottomNavVisibility}
        onEditPress={handleEditPress}
        insets={insets}
      />

      <Animated.View style={getAnimatedStyle(0)}>
        <View
          style={[
            styles.section,
            {
              paddingLeft: screenPaddingLeft,
              paddingRight: screenPaddingRight,
            },
          ]}
        >
          <ErrorBoundary fallback="Clock widget lỗi">
            <ClockWidget width={usableWidth - SCREEN_PADDING * 2} />
          </ErrorBoundary>
        </View>
      </Animated.View>

      <Animated.View style={getAnimatedStyle(1)}>
        <View
          style={[
            styles.grid,
            {
              paddingLeft: screenPaddingLeft,
              paddingRight: screenPaddingRight,
            },
          ]}
        >
          <MetricsGrid
            cpu={cpu}
            ram={ram}
            disk={disk}
            up={up}
            down={down}
            battery={battery}
            charging={charging}
            cardWidth={cardWidth}
          />
          <ConnectionCard
            status={status}
            statusLabel={statusLabel}
            computerName={computerName}
            latency={latency}
            lastSync={lastSync}
          />
        </View>
      </Animated.View>

      <Animated.View style={getAnimatedStyle(2)}>
        <View
          style={[
            styles.section,
            {
              paddingLeft: screenPaddingLeft,
              paddingRight: screenPaddingRight,
            },
          ]}
        >
          <StreamDeckSection
            buttonSize={buttonSize}
            onButtonPress={debouncedStreamDeck}
            onAddWidgetPress={handleAddWidgetPress}
          />
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {},
  content: { gap: Spacing.md },
  section: { marginBottom: Spacing.md },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
});
