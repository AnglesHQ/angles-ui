// ============================================================================
// Shared ApexCharts configuration
// ----------------------------------------------------------------------------
// Central place for chart colour and option defaults so every chart stays
// consistent with the app theme and with each other.
// ============================================================================

// Status series colours — the same design tokens the rest of the app uses, so
// charts follow light/dark automatically. Order: PASS, FAIL, ERROR, SKIPPED.
export const STATUS_COLORS = [
  'var(--pass-color)',
  'var(--fail-color)',
  'var(--error-color)',
  'var(--skipped-color)',
];

// Categorical palette for non-status series (e.g. platform distribution).
// Like STATUS_COLORS these are design tokens rather than literals, so each hue
// gets a dark-mode variant (see `--chart-series-*` in tokens/_color.less) and
// the charts follow the theme instead of holding one fixed ramp.
export const CATEGORICAL_PALETTE = [
  'var(--chart-series-1)', // indigo
  'var(--chart-series-2)', // teal
  'var(--chart-series-3)', // amber
  'var(--chart-series-4)', // violet
  'var(--chart-series-5)', // rose
  'var(--chart-series-6)', // cyan
  'var(--chart-series-7)', // lime
  'var(--chart-series-8)', // blue
  'var(--chart-series-9)', // pink
  'var(--chart-series-10)', // orange
];

// Deterministic colour for the Nth distinct category (by first-seen order).
// Replaces the old getRandomColor(), so a given platform keeps the same colour
// across renders and reloads.
export const getPaletteColor = (index) => CATEGORICAL_PALETTE[index % CATEGORICAL_PALETTE.length];

// Groups platform breakdowns by device/browser + version rather than just
// platformName, so e.g. "iPhone 12 [iOS 16]" and "Pixel 6 [Android 13]" don't
// collapse into a single "iOS"/"Android" bucket. Shared by every platform
// chart/table so they all agree on what counts as one distinct platform.
export const getPlatformLabel = (platform) => {
  if (platform.deviceName) {
    return `${platform.deviceName} [${platform.platformName}${platform.platformVersion ? platform.platformVersion : ''}]`;
  }
  return `${platform.browserName}${platform.browserVersion ? ` - ${platform.browserVersion}` : ''} [${platform.platformName}]`;
};

// Legend formatter shared by the result charts — renders "Label: <strong>N</strong>".
export const resultLegendFormatter = (seriesName, opts) => `${seriesName}: <strong> ${opts.w.config.series[opts.seriesIndex]}</strong>`;

// Donut `plotOptions` for the status result charts (test-run, execution history,
// dashboard). The centre of the ring carries the pass rate — the one number
// people actually want from a results breakdown — instead of apex's built-in
// "total", which would just re-sum every slice.
//
// `statusOrder` maps slice index -> status key, so the pass slice can be found
// even when zero-valued statuses have been filtered out of the series.
// Font sizes are concrete px: apex writes these into an inline style attribute,
// where a var() reference would not resolve.
export const buildStatusDonutPlotOptions = (statusOrder, passRateLabel) => ({
  pie: {
    donut: {
      size: '68%',
      labels: {
        show: true,
        value: {
          fontSize: '30px',
          fontWeight: 700,
          offsetY: 0,
        },
        total: {
          show: true,
          showAlways: true,
          label: passRateLabel,
          fontSize: '12px',
          formatter: (w) => {
            const series = w.globals.seriesTotals;
            const total = series.reduce((sum, value) => sum + value, 0);
            if (total === 0) {
              return '0%';
            }
            const passIndex = statusOrder.indexOf('PASS');
            const passed = passIndex === -1 ? 0 : series[passIndex];
            return `${Math.round((passed / total) * 100)}%`;
          },
        },
      },
    },
  },
});

// Returns a FRESH base options object each call, so callers may safely mutate
// their copy (fixes the previous shared module-level `defaultOptions` bug where
// charts leaked yaxis/events state into one another).
export const buildBaseOptions = ({
  background = 'var(--main-panel-background)',
  foreColor = 'var(--main-panel-font-color)',
} = {}) => ({
  chart: {
    toolbar: { show: false },
    zoom: { enabled: false },
    animations: { enabled: false },
    background,
    foreColor,
  },
});
