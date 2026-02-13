import { FlashList } from '@shopify/flash-list';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTickerFeed } from '../../hooks/useTickerFeed';
import { useTickerStore } from '../../store/tickerStore';
import { TickerCard } from '../components/TickerCard';

const formatCompact = (value: number) => {
  if (!Number.isFinite(value)) {
    return '0';
  }

  const absValue = Math.abs(value);
  if (absValue >= 1_000_000_000_000) {
    return `${(value / 1_000_000_000_000).toFixed(2)}T`;
  }
  if (absValue >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (absValue >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (absValue >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  }

  return value.toFixed(2);
};

export function HomeScreen() {
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
            {formatCompact(marketStats.totalQuoteVolume)}
          </Text>
        </View>
      </View>

      {__DEV__ ? (
        <View style={styles.debugPanel}>
          <Text style={styles.debugTitle}>Debug Stats (dev only)</Text>
          <Text style={styles.debugText}>WS msg/s: {debugStats.incomingMessagesPerSecond}</Text>
          <Text style={styles.debugText}>UI flush/s: {debugStats.uiFlushesPerSecond}</Text>
          <Text style={styles.debugText}>Pending symbols: {debugStats.pendingSymbols}</Text>
          <Text style={styles.debugText}>Total messages: {formatCompact(debugStats.totalMessages)}</Text>
          <Text style={styles.debugText}>Total flushes: {formatCompact(debugStats.totalUiFlushes)}</Text>
        </View>
      ) : null}

      {tickers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.empty}>Connecting to Binance stream...</Text>
          <Text style={styles.emptyHint}>Tickers will appear as soon as first batch arrives.</Text>
        </View>
      ) : (
        <FlashList
          data={tickers}
          keyExtractor={(item) => item.symbol}
          renderItem={({ item }) => <TickerCard ticker={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 32 }]}
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#0b0b16',
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
    color: '#fff',
  },
  subtitle: {
    marginTop: 2,
    color: '#8c92b6',
    fontSize: 12,
  },
  reconnectButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2e3350',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#161a2d',
  },
  reconnectText: {
    color: '#d7dcff',
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
    backgroundColor: '#15182b',
    borderWidth: 1,
    borderColor: '#2b3050',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: '#d6dcff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  updateText: {
    fontSize: 11,
    color: '#8e94bc',
  },
  statusRight: {
    alignItems: 'flex-end',
  },
  retryText: {
    fontSize: 11,
    color: '#fbbf24',
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
    borderColor: '#2b3050',
    backgroundColor: '#131a31',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  metricPillLabel: {
    color: '#8892c8',
    fontSize: 10,
    marginBottom: 3,
  },
  metricPillValue: {
    color: '#e2e6ff',
    fontSize: 12,
    fontWeight: '700',
  },
  positiveText: {
    color: '#34d399',
  },
  negativeText: {
    color: '#fb7185',
  },
  listContent: {
    paddingBottom: 32,
  },
  emptyContainer: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#22284a',
    backgroundColor: '#151a30',
    padding: 16,
    marginTop: 12,
  },
  empty: {
    color: '#d7dcff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyHint: {
    marginTop: 6,
    color: '#9097bf',
    fontSize: 12,
  },
  debugPanel: {
    marginVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2f4f',
    backgroundColor: '#0f1324',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  debugTitle: {
    fontSize: 11,
    color: '#98a4e8',
    fontWeight: '700',
    marginBottom: 6,
  },
  debugText: {
    fontSize: 11,
    color: '#bec8ff',
    marginBottom: 2,
  },
});
