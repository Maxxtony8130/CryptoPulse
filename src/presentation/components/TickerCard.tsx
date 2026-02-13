import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { Ticker } from '../../domain/models/Ticker';

interface TickerCardProps {
  ticker: Ticker;
}

const formatPrice = (value: number) =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: value >= 100 ? 2 : 4,
    maximumFractionDigits: value >= 100 ? 2 : 5,
  });

const formatCompact = (value: number) =>
  new Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value);

const formatSigned = (value: number, fractionDigits = 2) => {
  const fixed = value.toFixed(fractionDigits);
  return value > 0 ? `+${fixed}` : fixed;
};

export function TickerCard({ ticker }: TickerCardProps) {
  const flash = useSharedValue(0);

  useEffect(() => {
    if (ticker.direction === 'flat') {
      return;
    }

    flash.value = 1;
    flash.value = withTiming(0, {
      duration: 650,
      easing: Easing.out(Easing.quad),
    });
  }, [flash, ticker.direction, ticker.lastPrice]);

  const animatedCardStyle = useAnimatedStyle(() => {
    const highlightColor = ticker.direction === 'up' ? '#113827' : '#451a1a';

    return {
      backgroundColor: interpolateColor(
        flash.value,
        [0, 1],
        [styles.card.backgroundColor as string, highlightColor]
      ),
    };
  }, [ticker.direction]);

  const isPositive = ticker.priceChangePercent >= 0;
  const trendSymbol = ticker.direction === 'up' ? '▲' : ticker.direction === 'down' ? '▼' : '•';
  const formattedChangePercent = `${formatSigned(ticker.priceChangePercent)}%`;
  const formattedPriceChange = formatSigned(ticker.priceChange, 4);
  const spreadPercent =
    ticker.lastPrice > 0 ? ((ticker.spread / ticker.lastPrice) * 100).toFixed(3) : '0.000';

  return (
    <Animated.View style={[styles.card, animatedCardStyle]}>
      <View style={styles.topRow}>
        <View style={styles.symbolBlock}>
          <Text style={styles.symbol}>{ticker.symbol}</Text>
          <Text style={styles.liveTag}>LIVE</Text>
        </View>
        <Text style={[styles.changeBadge, isPositive ? styles.positiveBadge : styles.negativeBadge]}>
          {trendSymbol} {formattedChangePercent}
        </Text>
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.price}>${formatPrice(ticker.lastPrice)}</Text>
        <Text style={styles.reference}>Open ${formatPrice(ticker.openPrice)}</Text>
      </View>

      <View style={styles.rangeRow}>
        <Text style={styles.rangeText}>24h Low ${formatPrice(ticker.low)}</Text>
        <Text style={styles.rangeDot}>•</Text>
        <Text style={styles.rangeText}>24h High ${formatPrice(ticker.high)}</Text>
      </View>

      <View style={styles.metricGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>24h Delta</Text>
          <Text style={[styles.metricValue, isPositive ? styles.positive : styles.negative]}>
            {formattedPriceChange}
          </Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Spread</Text>
          <Text style={styles.metricValue}>
            {ticker.spread.toFixed(6)} ({spreadPercent}%)
          </Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Trades</Text>
          <Text style={styles.metricValue}>{formatCompact(ticker.tradeCount)}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Volume</Text>
          <Text style={styles.metricValue}>{formatCompact(ticker.quoteVolume)}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: '#141426',
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a45',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  symbolBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveTag: {
    marginLeft: 8,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
    backgroundColor: '#1d2240',
    color: '#9cadff',
    fontSize: 10,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  symbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#d7deff',
  },
  price: {
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
  },
  reference: {
    color: '#8d95be',
    fontSize: 12,
  },
  rangeRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rangeText: {
    fontSize: 12,
    color: '#8d95be',
  },
  rangeDot: {
    marginHorizontal: 8,
    color: '#6771a8',
  },
  changeBadge: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: 'hidden',
  },
  positiveBadge: {
    color: '#3ce287',
    backgroundColor: '#103124',
  },
  negativeBadge: {
    color: '#ff7688',
    backgroundColor: '#3a1c23',
  },
  metricGrid: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricCard: {
    width: '48.5%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#282b48',
    backgroundColor: '#101427',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  metricLabel: {
    fontSize: 11,
    color: '#7f89be',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 13,
    color: '#dce2ff',
    fontWeight: '600',
  },
  positive: { color: '#22c55e' },
  negative: { color: '#ef4444' },
});
