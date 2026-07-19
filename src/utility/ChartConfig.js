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

// Categorical palette for non-status series (e.g. platform distribution). Vivid
// mid-tones chosen to read on both light and dark backgrounds.
export const CATEGORICAL_PALETTE = [
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#f59e0b', // amber
  '#a855f7', // violet
  '#f43f5e', // rose
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#3b82f6', // blue
  '#ec4899', // pink
  '#f97316', // orange
];

// Deterministic colour for the Nth distinct category (by first-seen order).
// Replaces the old getRandomColor(), so a given platform keeps the same colour
// across renders and reloads.
export const getPaletteColor = (index) => CATEGORICAL_PALETTE[index % CATEGORICAL_PALETTE.length];

// Legend formatter shared by the result charts — renders "Label: <strong>N</strong>".
export const resultLegendFormatter = (seriesName, opts) => `${seriesName}: <strong> ${opts.w.config.series[opts.seriesIndex]}</strong>`;

// Returns a FRESH base options object each call, so callers may safely mutate
// their copy (fixes the previous shared module-level `defaultOptions` bug where
// charts leaked yaxis/events state into one another).
export const buildBaseOptions = ({
  background = 'var(--main-panel-background)',
  foreColor = 'var(--main-panel-font-color)',
} = {}) => ({
  chart: {
    toolbar: { show: false },
    animations: { enabled: false },
    background,
    foreColor,
  },
});
