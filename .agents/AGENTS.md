# Angles UI — Agent Design System Rules

These rules apply to **all** tasks in the `angles-ui` workspace.
Always follow them without needing to be reminded.

---

## 1. Stack & Styling Approach

- This is a **Next.js** app using **LESS**, compiled to `src/styles/main.css` by
  `npm run build-css` (run automatically by `npm run dev` / `npm run build`).
- The style entrypoint is [`src/styles/index.less`](../src/styles/index.less). It imports, in
  cascade order: design tokens (`src/styles/tokens/`), mixins, base element styles,
  app-chrome layout, RSuite overrides, shared components, then page/feature styles.
- Component-level styles are `styles.less` files co-located with each component/page and
  imported from `index.less`. Pages fully covered by the shared page chrome have **no**
  styles.less of their own.
- **Never** introduce raw hex codes or hard-coded `hsl()` values for UI colours.
  Always reference an existing CSS custom property (e.g. `var(--main-panel-background)`).
- **Never** import Tailwind, Bootstrap, react-bootstrap, or any additional CSS framework.
  The UI library is **RSuite** only.

---

## 2. CSS Design Tokens

Tokens live in `src/styles/tokens/`:

- `_color.less` — primitive palette + semantic colour tokens (the only file where raw colour values are allowed)
- `_space.less` — `--space-1` … `--space-8` (4px rhythm) for padding/margin/gap
- `_radius.less` — `--radius-xs/sm/md/lg/pill`
- `_elevation.less` — `--shadow-sm/md/lg`, `--card-shadow`, `--card-border-color`
- `_typography.less` — `--font-size-xs…4xl`, `--font-weight-*`, `--line-height-*`
- `_motion.less` — `--transition-fast/base`

### Colour architecture ("Ember & Sand")

Two layers: a **primitive palette** (`--master-color-*`, `--master-font-color-*`,
`--orange-300…600`, status colours) and **semantic tokens** that reference the
primitives. Components must consume **semantic** tokens.

**Surfaces / layout** — `--body-background`, `--surface-raised`, `--surface-sunken`,
`--main-panel-*`, `--sub-panel-*`

**Navigation** — `--nav-background`, `--nav-font-color`, `--nav-hover-color`, `--nav-hover-font-color`

**Tables** — `--main-table-*`, `--sub-table-*`

**Tabs** — `--tabs-overall-background`, `--active-tab-*`, `--inactive-tab-*`

**Buttons** — `--button-*` (primary maps to the ember accent)

**Select / picker** — `--select-picker-*`

**Modal** — `--modal-background`, `--modal-font-color`, `--modal-secondary-font-color`

**Carousel / screenshot viewer** — `--carousel-*`, `--screenshot-*`, `--baseline-overlay-background`

**Borders & icons** — `--border-color`, `--border-subtle`, `--icon-action-color`,
`--icon-disabled-color`, `--info-color`, `--focus-ring`

**Result status colours** *(do not change these hues)*
- `--pass-color`, `--fail-color`, `--error-color`, `--skipped-color`
  (light values in `:root`; dark mode overrides them with brighter variants)

**Links** — `--link-color-1`, `--link-color-1-focus`, `--link-color-1-disabled`

---

## 3. Dark Mode

- Dark mode applies in two ways (both defined in `_color.less` via the
  `.theme-dark-primitives()` mixin):
  1. Explicit selection: `:root[data-theme="dark"]` — set by the theme toggle; always wins.
  2. OS preference: `@media (prefers-color-scheme: dark)` on `:root:not([data-theme="light"])` —
     a fallback for users who have not chosen a theme.
- Do **not** add further `@media (prefers-color-scheme: …)` blocks anywhere else;
  theme-dependent values belong in the primitive overrides in `_color.less`.
- Because theming happens at the **primitive** layer, a new semantic token defined
  against primitives usually needs no dark override. If a token's light value is a
  literal (e.g. an rgba hairline), add its dark value to `.theme-dark-primitives()`.

---

## 4. Typography

- The global font stack is defined on `body` in `src/styles/base.less`.
- Do not introduce a new `font-family` declaration in components unless the user explicitly
  requests it (monospace token/code text may use the shared `.token-input` class or `code`).
- Font sizes/weights **must** come from the typography tokens; font colours from semantic
  colour tokens. Never raw values.

---

## 5. Buttons

- Primary action buttons use `.btn-primary`; secondary/deactivated use `.btn-secondary`;
  outline style uses `.btn-ghost` (all defined in `src/styles/components.less`).
- The old `.filter-submit-button` / `.filter-cancel-button` names are **removed** — do not
  reintroduce them.
- Do not override button colours inline or with ad-hoc LESS rules; extend the token set instead.

---

## 6. Shared UI Patterns (components.less)

Use these before writing any new page-level CSS:

- **Page chrome** — `.page` (padded page wrapper), `.page-panel` (card surface),
  `.page-panel-header`, `.page-section-title`, `.page-section`, `.page-section-table`,
  `.page-toolbar`, `.page-help-text`
- **Detail pages** — `.page-detail-header`, `.page-detail-header-title`, `.detail-row`
- **Status colours** — `.status-pass/fail/error/skipped/info` (text),
  `.status-bg-*` (fills). Status suffixes are **lowercase**; build them from API values
  with `status.toLowerCase()`. Never re-declare status colour rules per page.
- **Inline alerts** — `.app-alert` with `.app-alert-info` / `.app-alert-error`
  (loading / empty / error states inside page content). Pair with RSuite `<Loader />`.
- **Links** — `.link-action`, `.link-danger`, `.link-separator` for row actions.
- **Form feedback** — `.form-warning-text`, `.form-error-text`.
- **Brand logo** — `.brand-logo-icon`, `.brand-logo-text` (sidebar + login).
- **Buttons / tabs / chart panels / toolbar** — `.btn-*`, `.tabs-container`,
  `.chart-panel`, `.top-menu-stack`.
- **Mixins** (`src/styles/mixins.less`) — `.card-surface()`, `.focus-ring()`,
  `.interactive-lift()`.

---

## 7. Confirmation Dialogs

- **Never** use `window.confirm()`, `window.alert()`, or `window.prompt()`.
- Always use the reusable `ConfirmModal` component at `src/components/common/ConfirmModal.js`
  (props: `open`, `title`, `message`, `confirmLabel`, `cancelLabel`, `onConfirm`, `onCancel`).
- Its buttons use `.btn-primary` / `.btn-secondary`; styles live in the `.confirm-modal`
  block in `components.less`. Do not add per-page overrides.

---

## 8. Component Conventions

- Class names use **kebab-case** (e.g. `dashboard-header`, `top-menu-stack`). No camelCase.
- Tables: use the existing `.rs-table` overrides in `rsuite-overrides.less`; don't duplicate
  them in component styles. Plain `<table>` detail views use `.screenshot-table`-style
  classes in the owning feature's styles.less.
- Panels / cards: `--main-panel-background` for top-level panels, `--sub-panel-background`
  for nested cards.
- Icons: colour with `--main-panel-icon-color` / `--sub-panel-icon-color` or the shared
  status classes; never hard-code a colour. Nav icons use `.nav-item-icon`.
- Links: inherit from `--link-color-1` / `--link-color-1-focus`; do not override `a`
  colour per-component.
- Spacing/radius: use `--space-*` and `--radius-*` tokens, not ad-hoc pixel values.
- Loading states: RSuite `<Loader />` inside an `.app-alert` (or RSuite `Message`).
  There is **no** font-awesome in this app — never use `fa`/`fas` icon classes.

---

## 9. Adding New Tokens

When a design element can't be expressed by an existing token:
1. Define the new token in `:root` in `src/styles/tokens/_color.less` (or the relevant
   token file), referencing primitives wherever possible.
2. If its value cannot derive from a primitive, add a dark value to
   `.theme-dark-primitives()` in the same file.
3. Name it semantically (e.g. `--modal-overlay-background`), not by value.
4. Document it in a comment block near its peers.
5. Remove tokens that lose their last consumer — no dead tokens.

---

## 10. Localization & Translations

- **Any text added to the UI** must use the `FormattedMessage` component with a specific `id`.
  Never hardcode English (or any other language) strings directly into JSX.
- You must add the translation string for the new `id` in **all four** language files:
  - `src/translations/en.json` — English
  - `src/translations/cn.json` — Chinese
  - `src/translations/nl.json` — Dutch
  - `src/translations/th.json` — Thai
- **Every** language file must receive the new key. Omitting any language file is not acceptable.

### Translation ID naming convention

IDs follow a hierarchical dot-notation pattern that mirrors the location and purpose of the string.
Study the existing keys in `src/translations/en.json` before adding new ones, and follow the same pattern:

| Segment | Meaning | Examples |
|---|---|---|
| `nav` | Top-level navigation items | `nav.dashboard`, `nav.theme.dark` |
| `app` | Shared / utility strings | `app.result.pass`, `app.utils.duration.seconds` |
| `page.<name>` | Strings scoped to a specific page | `page.dashboard`, `page.metrics` |
| `page.<name>.<area>` | Sub-area within that page | `page.dashboard.filters`, `page.dashboard.builds-table` |
| `page.<name>.<area>.<element>` | Specific element / label | `page.dashboard.filters.label.team`, `page.dashboard.builds-table.header.result` |

Rules:
- Use **kebab-case** for every segment (e.g. `build-details`, not `buildDetails` or `build_details`).
- Be as specific as needed — prefer `page.settings.environments.delete-confirm-title` over a vague `environments.delete`.
- Reuse an existing key rather than creating a near-duplicate with a different id.

### Usage example

```jsx
import { FormattedMessage } from 'react-intl';

// ✅ Correct
<span><FormattedMessage id="page.dashboard.filters.label.team" /></span>

// ❌ Wrong — hardcoded string
<span>Team</span>
```

---

## 11. What NOT to Do

- ❌ Hard-code any colour value (`#abc`, `rgb(...)`, `hsl(...)`) in a component `.less` file.
- ❌ Use `!important` unless overriding a third-party library (RSuite) rule that cannot be avoided.
- ❌ Introduce new CSS utility classes that duplicate the shared classes in `components.less`.
- ❌ Apply `color` or `background-color` inline via JSX `style` props for theming purposes.
- ❌ Add new `@media (prefers-color-scheme: dark)` blocks; theme via the primitives in `_color.less`.
- ❌ Use `window.confirm()`, `window.alert()`, or `window.prompt()`; use `ConfirmModal` instead.
- ❌ Hardcode text strings in the UI instead of using `FormattedMessage`.
- ❌ Import Bootstrap / react-bootstrap or font-awesome — both have been removed from the app.
