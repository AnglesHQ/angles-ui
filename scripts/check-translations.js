#!/usr/bin/env node
/* eslint-disable no-console */
// ============================================================================
// Translation completeness check
// ----------------------------------------------------------------------------
// `en.json` is the reference. Every other file in src/translations/ must carry
// exactly the same key set, and every message id referenced in the code must
// exist in the reference.
//
//   npm run check-translations
//
// Reports four kinds of problem:
//   MISSING     a key in en.json that a locale does not have  → untranslated UI
//   EXTRA       a key a locale has that en.json does not      → stale, dead weight
//   UNDEFINED   an id used in code but absent from en.json    → renders as raw id
//   PLACEHOLDER a translation that dropped an ICU argument    → renders wrong
//   UNTRANSLATED a value byte-identical to English            → likely a placeholder
//
// The locale list is derived from the directory, so adding a language file is
// enough to bring it under the check — nothing here needs updating.
// ============================================================================

const fs = require('fs');
const path = require('path');

const TRANSLATIONS_DIR = path.join(__dirname, '..', 'src', 'translations');
const SRC_DIR = path.join(__dirname, '..', 'src');
const REFERENCE = 'en';

// `translations.json` is the language registry, not a message catalogue.
const NOT_A_CATALOGUE = new Set(['translations.json']);

// Values legitimately identical across languages: proper nouns, symbols,
// numbers, and the language names in the picker.
const SAME_IS_FINE = /^[\W\d_]*$/;
const PROPER_NOUNS = new Set([
  'Angles', 'Jira', 'Zephyr', 'Xray', 'OIDC', 'SAML', 'LDAP', 'Okta', 'JSON',
  'CSV', 'URL', 'API', 'ID', 'UUID', 'Git', 'CI', 'QA', 'Sepia', 'Slate',
]);

const readCatalogue = (file) => {
  const full = path.join(TRANSLATIONS_DIR, file);
  try {
    return JSON.parse(fs.readFileSync(full, 'utf8'));
  } catch (err) {
    console.error(`\n  ${file} is not valid JSON: ${err.message}`);
    process.exit(1);
    return null;
  }
};

const walk = (dir, out = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'translations' && entry.name !== 'node_modules') walk(full, out);
    } else if (/\.(js|jsx)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
};

// Ids referenced from code. Template literals and variables are skipped —
// they cannot be resolved statically, so they are the author's responsibility.
const collectUsedIds = () => {
  const ids = new Set();
  const patterns = [
    /FormattedMessage[^>]*?\bid=["']([^"']+)["']/gs,
    /formatMessage\(\s*\{\s*id:\s*["']([^"']+)["']/g,
  ];
  for (const file of walk(SRC_DIR)) {
    const source = fs.readFileSync(file, 'utf8');
    for (const pattern of patterns) {
      for (const match of source.matchAll(pattern)) {
        if (!/[${]/.test(match[1])) ids.add(match[1]);
      }
    }
  }
  return ids;
};

const localeFiles = fs.readdirSync(TRANSLATIONS_DIR)
  .filter((f) => f.endsWith('.json') && !NOT_A_CATALOGUE.has(f));

const reference = readCatalogue(`${REFERENCE}.json`);
const referenceKeys = Object.keys(reference);
let failed = false;

console.log(`Reference: ${REFERENCE}.json (${referenceKeys.length} keys)\n`);

// ── Ids used in code but not defined ────────────────────────────────────────
const undefinedIds = [...collectUsedIds()].filter((id) => !(id in reference)).sort();
if (undefinedIds.length) {
  failed = true;
  console.log(`UNDEFINED — used in code, missing from ${REFERENCE}.json (${undefinedIds.length}):`);
  undefinedIds.forEach((id) => console.log(`   ${id}`));
  console.log();
}

// ── Per-locale completeness ─────────────────────────────────────────────────
for (const file of localeFiles.sort()) {
  const code = path.basename(file, '.json');
  if (code === REFERENCE) continue;

  const catalogue = readCatalogue(file);
  const missing = referenceKeys.filter((k) => !(k in catalogue));
  const extra = Object.keys(catalogue).filter((k) => !(k in reference));

  // ICU arguments must survive translation: `{count}` dropped from a string
  // renders the wrong text with no error. Only leading argument names are
  // compared — plural categories legitimately differ, since Thai and Chinese
  // have no grammatical plural and use `other` alone.
  const args = (s) => new Set(
    [...s.matchAll(/\{\s*(\w+)\s*(?:,\s*(?:plural|select|number|date|time)\b)?\s*[,}]/g)]
      .map((m) => m[1]),
  );
  const droppedArgs = Object.keys(catalogue).filter((k) => {
    if (!(k in reference)) return false;
    const expected = args(reference[k]);
    const actual = args(catalogue[k]);
    return [...expected].some((a) => !actual.has(a));
  });
  const untranslated = Object.keys(catalogue).filter((k) => {
    const value = catalogue[k];
    return k in reference && value === reference[k]
      && !SAME_IS_FINE.test(value) && !PROPER_NOUNS.has(value.trim());
  });

  const problems = missing.length + extra.length + droppedArgs.length;
  if (problems === 0 && untranslated.length === 0) {
    console.log(`  ${code}  complete (${Object.keys(catalogue).length} keys)`);
    continue;
  }
  if (problems > 0) failed = true;

  console.log(`  ${code}  ${missing.length} missing, ${extra.length} extra`
    + (droppedArgs.length ? `, ${droppedArgs.length} dropped placeholders` : '')
    + (untranslated.length ? `, ${untranslated.length} same as English` : ''));

  const preview = (label, keys) => {
    if (!keys.length) return;
    console.log(`     ${label}:`);
    keys.slice(0, 10).forEach((k) => console.log(`       ${k}`));
    if (keys.length > 10) console.log(`       … and ${keys.length - 10} more`);
  };
  preview('missing', missing);
  preview('extra (stale — remove)', extra);
  preview('dropped an ICU placeholder', droppedArgs);
  // Same-as-English is a warning, not a failure: some strings genuinely match.
  preview('same as English (check)', untranslated);
}

console.log();
if (failed) {
  console.log('Translation check FAILED. Every locale must carry every key in '
    + `${REFERENCE}.json — see .agents/AGENTS.md §10.`);
  process.exit(1);
}
console.log('Translation check passed.');
