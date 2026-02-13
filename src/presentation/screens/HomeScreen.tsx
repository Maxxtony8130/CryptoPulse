import { FlashList } from '@shopify/flash-list';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTickerFeed } from '../../hooks/useTickerFeed';
import { useTickerStore } from '../../store/tickerStore';
import { TickerCard } from '../components/TickerCard';
import type { AppTheme } from '../theme/appTheme';
import { getAppTheme } from '../theme/appTheme';
import { formatQuoteVolume } from '../utils/numberFormat';

export function HomeScreen() {
  const scheme = useColorScheme();
  const theme = useMemo(() => getAppTheme(scheme), [scheme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const tickers = useTickerStore((state) => state.tickerList);
  const connectionStatus = useTickerStore((state) => state.connectionStatus);
  const lastUiFlushAt = useTickerStore((state) => state.lastUiFlushAt);
  const { reconnect, flushIntervalMs, retryInfo, debugStats } = useTickerFeed();
  const lastUpdateLabel = useMemo(
    () => (lastUiFlushAt ? new Date(lastUiFlushAt).toLocaleTimeString() : 'Waiting for data...'),
    [lastUiFlushAt]
  );

  const statusColor =
    connectionStatus === 'connected'
      ? '#22c55e'
      : connectionStatus === 'reconnecting' || connectionStatus === 'connecting'
      ? '#f59e0b'
      : '#ef4444';
  const marketStats = useMemo(() => {
    const gainers = tickers.filter((ticker) => ticker.priceChangePercent > 0).length;
    const losers = tickers.filter((ticker) => ticker.priceChangePercent < 0).length;
    const avgMove =
      tickers.length > 0
        ? tickers.reduce((sum, ticker) => sum + ticker.priceChangePercent, 0) / tickers.length
        : 0;
    const totalQuoteVolume = tickers.reduce((sum, ticker) => sum + ticker.quoteVolume, 0);

    return {
      gainers,
      losers,
      avgMove,
      totalQuoteVolume,
    };
  }, [tickers]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 10 }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>CryptoPulse</Text>
          <Text style={styles.subtitle}>Top 10 pairs | UI refresh: {flushIntervalMs}ms</Text>
        </View>
        <Pressable style={styles.reconnectButton} onPress={reconnect}>
          <Text style={styles.reconnectText}>Reconnect</Text>
        </Pressable>
      </View>

      <View style={styles.statusRow}>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={styles.statusText}>{connectionStatus.toUpperCase()}</Text>
        </View>
        <View style={styles.statusRight}>
          {retryInfo.retryInSeconds !== null ? (
            <Text style={styles.retryText}>
              Retry #{retryInfo.attempt} in {retryInfo.retryInSeconds}s
            </Text>
          ) : null}
          <Text style={styles.updateText}>Last UI flush: {lastUpdateLabel}</Text>
        </View>
      </View>

      <View style={styles.marketStrip}>
        <View style={styles.metricPill}>
          <Text style={styles.metricPillLabel}>Breadth</Text>
          <Text style={styles.metricPillValue}>
            {marketStats.gainers}↑ / {marketStats.losers}↓
          </Text>
        </View>
        <View style={styles.metricPill}>
          <Text style={styles.metricPillLabel}>Avg Move</Text>
          <Text
            style={[
              styles.metricPillValue,
              marketStats.avgMove >= 0 ? styles.positiveText : styles.negativeText,
            ]}
          >
            {marketStats.avgMove >= 0 ? '+' : ''}
            {marketStats.avgMove.toFixed(2)}%
          </Text>
        </View>
        <View style={styles.metricPill}>
          <Text style={styles.metricPillLabel}>24h Quote Vol</Text>
          <Text style={styles.metricPillValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
            {formatQuoteVolume(marketStats.totalQuoteVolume)}
          </Text>
        </View>
      </View>

      {/* {__DEV__ ? (
        <View style={styles.debugPanel}>
          <Text style={styles.debugTitle}>Debug Stats (dev only)</Text>
          <Text style={styles.debugText}>WS msg/s: {debugStats.incomingMessagesPerSecond}</Text>
          <Text style={styles.debugText}>UI flush/s: {debugStats.uiFlushesPerSecond}</Text>
          <Text style={styles.debugText}>Pending symbols: {debugStats.pendingSymbols}</Text>
          <Text style={styles.debugText}>
            Total messages: {formatCompactNumber(debugStats.totalMessages, 2)}
          </Text>
          <Text style={styles.debugText}>Total flushes: {formatCompactNumber(debugStats.totalUiFlushes, 2)}</Text>
        </View>
      ) : null} */}

      {tickers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.empty}>Connecting to Binance stream...</Text>
          <Text style={styles.emptyHint}>Tickers will appear as soon as first batch arrives.</Text>
        </View>
      ) : (
        <FlashList
          data={tickers}
          keyExtractor={(item) => item.symbol}
          renderItem={({ item }) => <TickerCard ticker={item} theme={theme} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 32 }]}
        />
      )}

    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.screen.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 29,
    fontWeight: '700',
    color: theme.screen.title,
  },
  subtitle: {
    marginTop: 2,
    color: theme.screen.subtitle,
    fontSize: 12,
  },
  reconnectButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.screen.reconnectBorder,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: theme.screen.reconnectBackground,
  },
  reconnectText: {
    color: theme.screen.reconnectText,
    fontWeight: '600',
    fontSize: 12,
  },
  statusRow: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: theme.screen.statusBadgeBackground,
    borderWidth: 1,
    borderColor: theme.screen.statusBadgeBorder,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: theme.screen.statusText,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  updateText: {
    fontSize: 11,
    color: theme.screen.updateText,
  },
  statusRight: {
    alignItems: 'flex-end',
  },
  retryText: {
    fontSize: 11,
    color: theme.screen.retryText,
    marginBottom: 2,
    fontWeight: '600',
  },
  marketStrip: {
    marginBottom: 12,
    flexDirection: 'row',
    gap: 8,
  },
  metricPill: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.screen.metricPillBorder,
    backgroundColor: theme.screen.metricPillBackground,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  metricPillLabel: {
    color: theme.screen.metricPillLabel,
    fontSize: 10,
    marginBottom: 3,
  },
  metricPillValue: {
    color: theme.screen.metricPillValue,
    fontSize: 12,
    fontWeight: '700',
  },
  positiveText: {
    color: theme.screen.positive,
  },
  negativeText: {
    color: theme.screen.negative,
  },
  listContent: {
    paddingBottom: 32,
  },
  emptyContainer: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.screen.emptyBorder,
    backgroundColor: theme.screen.emptyBackground,
    padding: 16,
    marginTop: 12,
  },
  empty: {
    color: theme.screen.emptyText,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyHint: {
    marginTop: 6,
    color: theme.screen.emptyHint,
    fontSize: 12,
  },
  debugPanel: {
    marginVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.screen.debugBorder,
    backgroundColor: theme.screen.debugBackground,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  debugTitle: {
    fontSize: 11,
    color: theme.screen.debugTitle,
    fontWeight: '700',
    marginBottom: 6,
  },
  debugText: {
    fontSize: 11,
    color: theme.screen.debugText,
    marginBottom: 2,
  },
});
