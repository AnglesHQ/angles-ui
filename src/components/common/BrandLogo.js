import React from 'react';
import PropTypes from 'prop-types';

// ============================================================================
// Brand logo
// ----------------------------------------------------------------------------
// Drawn as inline SVG rather than shipped as a PNG so it can follow the theme.
// The previous `angles-icon.png` / `angles-text-logo.png` pair was a fixed
// orange, which was right while Ember was the only palette but clashes now that
// half the themes accent on blue or green — the wordmark ended up the only
// orange element on a Slate or Clay page, reading as a stray asset rather than
// a brand anchor.
//
// Colour comes from tokens, so a new theme needs no new asset:
//
//   --color-primary            the lit top face, the dimmed left face, wordmark
//   --color-primary-hover      the shaded right face
//   currentColor               the outline, inherited from the surrounding text
//
// `brandMonochrome` renders the whole mark in currentColor instead. That is
// what the accessible themes use: on Clay the accent is Okabe-Ito blue, and a
// two-tone mark competes with the status colours it is trying to stay out of
// the way of.
// ============================================================================

// Defaults are declared as parameter defaults rather than `BrandLogo.defaultProps`:
// defaultProps is deprecated for function components and is not applied by this
// build, which silently dropped the wordmark and the aria-label.
const BrandLogo = ({ showText = true, className = undefined, title = 'Angles' }) => (
  <span className={`brand-logo${className ? ` ${className}` : ''}`}>
    <svg
      className="brand-logo-icon"
      viewBox="0 0 100 108"
      role="img"
      aria-label={title}
      focusable="false"
    >
      {/* Isometric cube: top face lit with the accent, left face pale, right
          face the accent's shaded variant. Drawn on a 100x108 grid so the
          three faces meet exactly without seams. */}
      <path className="brand-cube-top" d="M50 2 96 28 50 54 4 28Z" />
      <path className="brand-cube-left" d="M4 28 50 54v52L4 80Z" />
      <path className="brand-cube-right" d="M96 28 50 54v52l46-26Z" />
      <path
        className="brand-cube-edge"
        d="M50 2 96 28v52l-46 26L4 80V28Z M4 28 50 54 96 28 M50 54v52"
        fill="none"
      />
    </svg>
    {showText && (
      <svg
        className="brand-logo-text"
        viewBox="0 0 300 64"
        role="img"
        aria-label={title}
        focusable="false"
      >
        {/* Wordmark set as a single text node: it inherits the app's font
            stack, so it stays legible at any size and needs no font file. */}
        <text
          className="brand-wordmark"
          x="0"
          y="46"
          textLength="292"
          lengthAdjust="spacingAndGlyphs"
        >
          Angles
        </text>
      </svg>
    )}
  </span>
);

BrandLogo.propTypes = {
  // The wordmark is hidden when the sidebar is collapsed to an icon rail.
  showText: PropTypes.bool,
  className: PropTypes.string,
  title: PropTypes.string,
};

export default BrandLogo;
