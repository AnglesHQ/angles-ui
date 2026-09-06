// ============================================================================
// Theme registry
// ----------------------------------------------------------------------------
// The single source of truth for which themes exist. The picker renders from
// this list and the cookie is validated against it, so adding a theme is:
//
//   1. Add its primitives block + registry selector in
//      `src/styles/tokens/_color.less` (see `_theme-contract.less` for the
//      contract a theme must satisfy).
//   2. Add an entry here.
//   3. Add its `labelId` string to every file in `src/translations/`.
//
// `id` is what goes in the `data-theme` attribute and the `theme` cookie, so it
// must match the selector in `_color.less` exactly.
//
// `polarity` groups the picker into Light / Dark sections. It is presentation
// only — the CSS derives its own polarity from `--theme-is-dark`, so the two
// cannot drift into disagreeing about how anything is painted.
// ============================================================================

// Order within a polarity is the order the picker lists them, so the two
// original Ember themes stay first.
export const THEMES = [
  { id: 'light', polarity: 'light', labelId: 'nav.theme.light' },
  { id: 'slate-light', polarity: 'light', labelId: 'nav.theme.slate-light' },
  { id: 'sepia', polarity: 'light', labelId: 'nav.theme.sepia' },
  { id: 'dark', polarity: 'dark', labelId: 'nav.theme.dark' },
  { id: 'slate-dark', polarity: 'dark', labelId: 'nav.theme.slate-dark' },
  { id: 'midnight', polarity: 'dark', labelId: 'nav.theme.midnight' },
];

// The theme applied when the user has made no choice. Leaving the cookie unset
// (rather than defaulting to a value) is deliberate: with no `data-theme`
// attribute the CSS follows the OS via `prefers-color-scheme`. Writing a
// default would pin every new user to light and ignore their system setting.
export const DEFAULT_THEME_ID = null;

const THEME_IDS = new Set(THEMES.map((theme) => theme.id));

// Guards against a stale or hand-edited cookie. An unknown id would otherwise
// be written to `data-theme`, matching no selector — the page would render with
// no theme's primitives at all rather than falling back cleanly.
export const isValidThemeId = (id) => THEME_IDS.has(id);

export const getThemesByPolarity = (polarity) => THEMES
  .filter((theme) => theme.polarity === polarity);

// Applies a theme to the document. Passing null (or an unknown id) removes the
// attribute, handing control back to the OS preference.
export const applyTheme = (id) => {
  const root = document.documentElement;
  if (isValidThemeId(id)) {
    root.setAttribute('data-theme', id);
  } else {
    root.removeAttribute('data-theme');
  }
};
