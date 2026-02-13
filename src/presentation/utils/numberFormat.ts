const trimTrailingZeros = (value: string) => value.replace(/\.?0+$/, '');

export const formatCompactNumber = (value: number, digits = 2) => {
  if (!Number.isFinite(value)) {
    return '0';
  }

  const absValue = Math.abs(value);
  const units: Array<[number, string]> = [
    [1_000_000_000_000, 'T'],
    [1_000_000_000, 'B'],
    [1_000_000, 'M'],
    [1_000, 'K'],
  ];

  for (const [threshold, suffix] of units) {
    if (absValue >= threshold) {
      return `${trimTrailingZeros((value / threshold).toFixed(digits))}${suffix}`;
    }
  }

  return trimTrailingZeros(value.toFixed(Math.min(digits, 2)));
};

export const formatPrice = (value: number) => {
  if (!Number.isFinite(value)) {
    return '0';
  }

  const absValue = Math.abs(value);
  if (absValue >= 1_000) {
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (absValue >= 1) {
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  }
  if (absValue >= 0.01) {
    return value.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 });
  }

  return value.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 8 });
};

export const formatSigned = (value: number, fractionDigits = 2) => {
  const fixed = value.toFixed(fractionDigits);
  return value > 0 ? `+${fixed}` : fixed;
};

export const formatPercent = (value: number, fractionDigits = 2) =>
  `${formatSigned(value, fractionDigits)}%`;

export const formatQuoteVolume = (value: number) => `$${formatCompactNumber(value, 2)}`;

export const formatSpread = (spread: number, referencePrice: number) => {
  if (!Number.isFinite(spread) || !Number.isFinite(referencePrice) || referencePrice <= 0) {
    return '0';
  }

  const bps = (spread / referencePrice) * 10_000;
  return `${formatPrice(spread)} • ${bps.toFixed(2)} bps`;
};
