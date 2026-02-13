export interface AppTheme {
  isDark: boolean;
  statusBarStyle: 'light' | 'dark';
  screen: {
    background: string;
    title: string;
    subtitle: string;
    reconnectBackground: string;
    reconnectBorder: string;
    reconnectText: string;
    statusBadgeBackground: string;
    statusBadgeBorder: string;
    statusText: string;
    updateText: string;
    retryText: string;
    metricPillBackground: string;
    metricPillBorder: string;
    metricPillLabel: string;
    metricPillValue: string;
    positive: string;
    negative: string;
    emptyBackground: string;
    emptyBorder: string;
    emptyText: string;
    emptyHint: string;
    debugBackground: string;
    debugBorder: string;
    debugTitle: string;
    debugText: string;
  };
  card: {
    background: string;
    border: string;
    shadow: string;
    symbol: string;
    liveTagBackground: string;
    liveTagText: string;
    price: string;
    reference: string;
    rangeText: string;
    rangeDot: string;
    positiveBadgeText: string;
    positiveBadgeBackground: string;
    negativeBadgeText: string;
    negativeBadgeBackground: string;
    metricBackground: string;
    metricBorder: string;
    metricLabel: string;
    metricValue: string;
    positive: string;
    negative: string;
    flashUp: string;
    flashDown: string;
  };
}

export const getAppTheme = (scheme: 'light' | 'dark' | null | undefined): AppTheme => {
  const isDark = scheme !== 'light';

  if (isDark) {
    return {
      isDark: true,
      statusBarStyle: 'light',
      screen: {
        background: '#0b0b16',
        title: '#ffffff',
        subtitle: '#8c92b6',
        reconnectBackground: '#161a2d',
        reconnectBorder: '#2e3350',
        reconnectText: '#d7dcff',
        statusBadgeBackground: '#15182b',
        statusBadgeBorder: '#2b3050',
        statusText: '#d6dcff',
        updateText: '#8e94bc',
        retryText: '#fbbf24',
        metricPillBackground: '#131a31',
        metricPillBorder: '#2b3050',
        metricPillLabel: '#8892c8',
        metricPillValue: '#e2e6ff',
        positive: '#34d399',
        negative: '#fb7185',
        emptyBackground: '#151a30',
        emptyBorder: '#22284a',
        emptyText: '#d7dcff',
        emptyHint: '#9097bf',
        debugBackground: '#0f1324',
        debugBorder: '#2a2f4f',
        debugTitle: '#98a4e8',
        debugText: '#bec8ff',
      },
      card: {
        background: '#141426',
        border: '#2a2a45',
        shadow: '#000000',
        symbol: '#d7deff',
        liveTagBackground: '#1d2240',
        liveTagText: '#9cadff',
        price: '#ffffff',
        reference: '#8d95be',
        rangeText: '#8d95be',
        rangeDot: '#6771a8',
        positiveBadgeText: '#3ce287',
        positiveBadgeBackground: '#103124',
        negativeBadgeText: '#ff7688',
        negativeBadgeBackground: '#3a1c23',
        metricBackground: '#101427',
        metricBorder: '#282b48',
        metricLabel: '#7f89be',
        metricValue: '#dce2ff',
        positive: '#22c55e',
        negative: '#ef4444',
        flashUp: '#113827',
        flashDown: '#451a1a',
      },
    };
  }

  return {
    isDark: false,
    statusBarStyle: 'dark',
    screen: {
      background: '#f4f7ff',
      title: '#111827',
      subtitle: '#5b6478',
      reconnectBackground: '#eef2ff',
      reconnectBorder: '#c9d2f5',
      reconnectText: '#1f2d5c',
      statusBadgeBackground: '#edf2ff',
      statusBadgeBorder: '#c9d2f5',
      statusText: '#1f2d5c',
      updateText: '#4f5a74',
      retryText: '#b45309',
      metricPillBackground: '#edf2ff',
      metricPillBorder: '#c9d2f5',
      metricPillLabel: '#5f6b87',
      metricPillValue: '#1f2d5c',
      positive: '#059669',
      negative: '#dc2626',
      emptyBackground: '#edf2ff',
      emptyBorder: '#c9d2f5',
      emptyText: '#1f2d5c',
      emptyHint: '#5f6b87',
      debugBackground: '#eef2ff',
      debugBorder: '#c9d2f5',
      debugTitle: '#334155',
      debugText: '#334155',
    },
    card: {
      background: '#ffffff',
      border: '#d6defb',
      shadow: '#64748b',
      symbol: '#0f172a',
      liveTagBackground: '#e0e7ff',
      liveTagText: '#3730a3',
      price: '#111827',
      reference: '#4b5563',
      rangeText: '#4b5563',
      rangeDot: '#64748b',
      positiveBadgeText: '#047857',
      positiveBadgeBackground: '#d1fae5',
      negativeBadgeText: '#b91c1c',
      negativeBadgeBackground: '#fee2e2',
      metricBackground: '#f5f8ff',
      metricBorder: '#d6defb',
      metricLabel: '#64748b',
      metricValue: '#111827',
      positive: '#059669',
      negative: '#dc2626',
      flashUp: '#bbf7d0',
      flashDown: '#fecaca',
    },
  };
};
