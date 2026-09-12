import React from 'react';
import PropTypes from 'prop-types';

// ============================================================================
// Theme swatch
// ----------------------------------------------------------------------------
// A three-chip preview of a theme, for the theme picker.
//
// The colours are NOT listed here. The swatch carries `data-theme`, and because
// the theme registry in `_color.less` matches that attribute unqualified (not
// `:root[data-theme=...]`), the element becomes an island of that theme's
// primitives; custom properties inherit, so the chips inside resolve the named
// theme's tokens rather than the active one's. A theme therefore gets a preview
// the moment it is registered — there is no second copy of its palette here to
// fall out of step with the first.
//
// The three chips are the values that actually tell the themes apart:
//
//   surface  --main-panel-background   the surface you look at all day
//   accent   --master-color-3          the single most distinguishing value
//   text     --main-panel-font-color   what separates the contrast pair
//
// Status colours are deliberately left out: they are near-identical across
// themes by design, so they would add width without adding information.
//
// Decorative, not informative — the row already names the theme in words, so
// the swatch is hidden from assistive tech rather than given a label of its own.
// ============================================================================
const ThemeSwatch = ({ themeId }) => (
  <span className="theme-swatch" data-theme={themeId} aria-hidden="true">
    <span className="theme-swatch-chip theme-swatch-chip-surface" />
    <span className="theme-swatch-chip theme-swatch-chip-accent" />
    <span className="theme-swatch-chip theme-swatch-chip-text" />
  </span>
);

ThemeSwatch.propTypes = {
  // Must match a registry selector in `_color.less` — i.e. a `THEMES` id.
  themeId: PropTypes.string.isRequired,
};

export default ThemeSwatch;
