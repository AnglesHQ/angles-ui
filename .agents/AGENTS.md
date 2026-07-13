# Angles UI — Agent Design System Rules

These rules apply to **all** tasks in the `angles-ui` workspace.
Always follow them without needing to be reminded.

---

## 1. Stack & Styling Approach

- This is a **Next.js** app using **LESS** (compiled to CSS via `next.config.mjs`).
- Global LESS variables live in [`src/styles/index.less`](../src/styles/index.less).
- Component-level styles are `styles.less` files co-located with each component/page.
- **Never** introduce raw hex codes or hard-coded `hsl()` values for UI colours.
  Always reference an existing CSS custom property (e.g. `var(--main-panel-background)`).
- **Never** import Tailwind, Bootstrap, or any additional CSS framework unless the user explicitly requests it.

---

## 2. CSS Design Tokens

All colour tokens are defined as CSS custom properties on `:root` in `src/styles/index.less`.
Dark-mode overrides live on `:root[data-theme="dark"]` in the same file.

### Master Palette

| Token | Light value | Dark value |
|---|---|---|
| `--master-color-1` | `hsl(0, 0%, 96%)` | `hsl(228, 16%, 24%)` |
| `--master-color-2` | `hsl(233, 17%, 91%)` | `hsl(233, 17%, 21%)` |
| `--master-color-3` | `hsl(28, 87%, 52%)` *(orange accent)* | same |
| `--master-color-2-relative` | `hsl(233, 17%, 75%)` | `hsl(240, 9%, 39%)` |
| `--master-color-3-relative` | `hsl(27, 63%, 46%)` | same |
| `--master-font-color-1` | `hsl(0, 0%, 0%)` | `hsl(240, 9%, 96%)` |
| `--master-font-color-2` | `hsl(0, 0%, 100%)` | `hsl(0, 23%, 97%)` |
| `--master-font-color-3` | `hsl(0, 0%, 34%)` | `hsl(0, 0%, 84%)` |
| `--master-icon-color` | `hsl(210, 100%, 60%)` | same |

### Semantic Tokens — use these in component styles

**Body / Layout**
- `--body-background`
- `--main-panel-background`, `--main-panel-font-color`, `--main-panel-secondary-font-color`, `--main-panel-icon-color`
- `--sub-panel-background`, `--sub-panel-font-color`, `--sub-panel-secondary-font-color`, `--sub-panel-icon-color`

**Navigation**
- `--nav-background`, `--nav-font-color`, `--nav-hover-color`, `--nav-hover-font-color`

**Tables (main)**
- `--main-table-header-background`, `--main-table-header-font-color`
- `--main-table-body-background`, `--main-table-body-font-color`, `--main-table-body-secondary-font-color`

**Tables (sub)**
- `--sub-table-header-background`, `--sub-table-header-font-color`
- `--sub-table-body-background`, `--sub-table-body-font-color`, `--sub-table-body-secondary-font-color`

**Tabs**
- `--tabs-overall-background`
- `--active-tab-background`, `--active-tab-font-color`, `--active-tab-font-color-hover`
- `--inactive-tab-background`, `--inactive-tab-font-color`

**Buttons**
- `--button-background`, `--button-font-color`
- `--button-hover-background`, `--button-hover-font-color`
- `--button-deactived-background`, `--button-deactivated-font-color`

**Select / Picker**
- `--select-picker-background`, `--select-picker-font-color`, `--select-picker-label-color`

**Carousel**
- `--carousel-background`, `--carousel-font-color`, `--carousel-active-font-color`, `--carousel-active-border-color`

**Result status colours** *(do not change these)*
- `--pass-color: #5fad6f`
- `--fail-color: #fc6571`
- `--skipped-color: #2485C1`
- `--error-color: #f5b83f`

**Links**
- `--link-color-1: #ee8308` *(orange)*
- `--link-color-1-focus: #f1b87f`
- `--link-color-1-disabled: grey`

---

## 3. Dark Mode

- Dark mode is toggled by setting `data-theme="dark"` on `:root` (not via `@media prefers-color-scheme`).
- **Every** new colour value must be verified against both `:root` (light) and `:root[data-theme="dark"]`.
- If a new semantic token is needed, add it to **both** blocks in `src/styles/index.less`.
- Never use `@media (prefers-color-scheme: dark)` — the app uses explicit theme switching.

---

## 4. Typography

- The global font stack is defined in `src/index.css`:
  `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`
- Do not introduce a new `font-family` declaration in components unless the user explicitly requests it.
- Font colours **must** come from a semantic token (e.g. `--main-panel-font-color`), never a raw value.

---

## 5. Buttons

- Primary action buttons use the `.filter-submit-button` class (defined in `src/styles/index.less`):
  - Background: `var(--button-background)` (orange accent `--master-color-3`)
  - Font: `var(--button-font-color)` (white)
  - Hover: `var(--button-hover-background)` / `var(--button-hover-font-color)`
- For deactivated / secondary state use the `.filter-cancel-button` class (backed by `--button-deactived-background` / `--button-deactivated-font-color`).
- Do not override button colours inline or with ad-hoc LESS rules; extend the existing token set instead.

---

## 6. Confirmation Dialogs

- **Never** use `window.confirm()`, `window.alert()`, or `window.prompt()`. They are unstyled, block the main thread, and cannot be themed.
- Always use the reusable `ConfirmModal` component at `src/components/common/ConfirmModal.js`.
- `ConfirmModal` props:
  - `open` — boolean controlling visibility
  - `title` — heading string (e.g. `"Delete Environment"`)
  - `message` — body text asking the user to confirm
  - `confirmLabel` — label for the confirm/destructive button (default: `"Confirm"`)
  - `cancelLabel` — label for the cancel button (default: `"Cancel"`)
  - `onConfirm` — callback when confirmed
  - `onCancel` — callback when cancelled or dismissed
- The confirm button uses `.filter-submit-button` and the cancel button uses `.filter-cancel-button` — both are automatically themed in light and dark mode.
- Styles live in the `.confirm-modal` block in `src/styles/index.less`; do not add per-page overrides.

---

## 7. Component Conventions

- Component LESS files are imported into `src/styles/index.less` — always add new imports there.
- Class names use **kebab-case** (e.g. `dashboard-header`, `top-menu-stack`).
- Tables: use the existing `.rs-table` overrides in `index.less`; don't duplicate them in component styles.
- Panels / cards: use `--main-panel-background` for top-level panels, `--sub-panel-background` for nested cards.
- Icons: colour with `--main-panel-icon-color` or `--sub-panel-icon-color`; never hard-code a colour.
- Links: always inherit from `--link-color-1` / `--link-color-1-focus`; do not override `a` colour per-component.

---

## 8. Adding New Tokens

When a design element can't be expressed by an existing token:
1. Define the new token in **both** `:root` (light) and `:root[data-theme="dark"]` inside `src/styles/index.less`.
2. Name it semantically (e.g. `--modal-overlay-background`), not by value.
3. Reference `--master-color-*` or `--master-font-color-*` as the token's value wherever possible.
4. Document it in a comment block near its peers.

---

## 9. Localization & Translations

- **Any text added to the UI** must use the `FormattedMessage` component with a specific `id`. Never hardcode English (or any other language) strings directly into JSX.
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

## 10. What NOT to Do

- ❌ Hard-code any colour value (`#abc`, `rgb(...)`, `hsl(...)`) directly in a component `.less` file.
- ❌ Use `!important` unless overriding a third-party library (RSuite) rule that cannot be avoided.
- ❌ Introduce new CSS utility classes that duplicate existing token-based classes.
- ❌ Apply `color` or `background-color` inline via JSX `style` props for theming purposes.
- ❌ Add a `@media (prefers-color-scheme: dark)` block; use `[data-theme="dark"]` instead.
- ❌ Use `window.confirm()`, `window.alert()`, or `window.prompt()`; use `ConfirmModal` instead.
- ❌ Hardcode text strings in the UI instead of using `FormattedMessage`.
