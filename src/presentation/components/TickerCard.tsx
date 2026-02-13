import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { Ticker } from '../../domain/models/Ticker';
import type { AppTheme } from '../theme/appTheme';
import {
  formatCompactNumber,
  formatPercent,
  formatPrice,
  formatQuoteVolume,
  formatSigned,
  formatSpread,
} from '../utils/numberFormat';

interface TickerCardProps {
  ticker: Ticker;
  theme: AppTheme;
}

export function TickerCard({ ticker, theme }: TickerCardProps) {
  const styles = useMemo(() => createStyles(theme), [theme]);
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
    const highlightColor = ticker.direction === 'up' ? theme.card.flashUp : theme.card.flashDown;

    return {
      backgroundColor: interpolateColor(
        flash.value,
        [0, 1],
        [styles.card.backgroundColor as string, highlightColor]
      ),
    };
  }, [theme.card.flashDown, theme.card.flashUp, ticker.direction]);

  const isPositive = ticker.priceChangePercent >= 0;
  const trendSymbol = ticker.direction === 'up' ? '▲' : ticker.direction === 'down' ? '▼' : '•';
  const formattedChangePercent = formatPercent(ticker.priceChangePercent, 2);
  const formattedPriceChange = formatSigned(ticker.priceChange, 4);

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
          <Text style={styles.metricValue}>{formatSpread(ticker.spread, ticker.lastPrice)}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Trades</Text>
          <Text style={styles.metricValue}>{formatCompactNumber(ticker.tradeCount, 2)}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Volume</Text>
          <Text style={styles.metricValue}>{formatQuoteVolume(ticker.quoteVolume)}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: theme.card.background,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.card.border,
    shadowColor: theme.card.shadow,
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
    backgroundColor: theme.card.liveTagBackground,
    color: theme.card.liveTagText,
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
    color: theme.card.symbol,
  },
  price: {
    fontSize: 30,
    fontWeight: '700',
    color: theme.card.price,
  },
  reference: {
    color: theme.card.reference,
    fontSize: 12,
  },
  rangeRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rangeText: {
    fontSize: 12,
    color: theme.card.rangeText,
  },
  rangeDot: {
    marginHorizontal: 8,
    color: theme.card.rangeDot,
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
    color: theme.card.positiveBadgeText,
    backgroundColor: theme.card.positiveBadgeBackground,
  },
  negativeBadge: {
    color: theme.card.negativeBadgeText,
    backgroundColor: theme.card.negativeBadgeBackground,
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
    borderColor: theme.card.metricBorder,
    backgroundColor: theme.card.metricBackground,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  metricLabel: {
    fontSize: 11,
    color: theme.card.metricLabel,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 13,
    color: theme.card.metricValue,
    fontWeight: '600',
  },
  positive: { color: theme.card.positive },
  negative: { color: theme.card.negative },
});
