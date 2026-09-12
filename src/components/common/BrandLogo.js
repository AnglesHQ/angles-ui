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
        viewBox="-1.5 -41.5 129.5 55"
        role="img"
        aria-label={title}
        focusable="false"
      >
        {/* Wordmark set as a single text node in the brand face.

            The viewBox is measured from the painted pixels, not guessed, and
            it must account for the STROKE as well as the glyphs. With the
            baseline at y=0, the outlined wordmark paints 40 units above it,
            11.5 below (the descender of 'g' plus half the stroke), and 126.25
            wide from 0.75 left of the origin. The box wraps that with ~1.5
            units of margin.

            A centred stroke extends half its width beyond the glyph edge, so a
            box fitted to the glyphs alone clips the outline — which is exactly
            what happened when the stroke grew to 2.6 against a box sized when
            it was much thinner.

            That tight box is what keeps the wordmark optically centred against
            the cube. The two SVGs are centred as boxes by `align-items: center`,
            so padding baked into one viewBox and not the other shows up as a
            vertical offset — the previous `0 0 300 64` box carried 15 units of
            slack below the ink, which pushed the text visibly high.

            No `textLength`: forcing the run to 292 units stretched this face to
            more than twice its natural width. */}
        <text className="brand-wordmark" x="0" y="0">
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
