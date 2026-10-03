// Formats a byte count in the viewer's locale, e.g. "4.2 MB". Uses Intl unit formatting so
// the unit is translated along with the number, with no message ids of its own. Starts at
// kilobytes: Intl's short form of a plain byte count reads "12 byte" in English.
export const formatBytes = (intl, bytes) => {
  if (bytes === undefined || bytes === null) return '';
  const units = ['kilobyte', 'megabyte', 'gigabyte'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return intl.formatNumber(value, {
    style: 'unit',
    unit: units[unit],
    unitDisplay: 'short',
    // Two decimals below 1 kB, so a 12-byte response reads "0.01 kB" rather than "0 kB".
    maximumFractionDigits: value < 1 ? 2 : 1,
  });
};

// Formats a duration in milliseconds, e.g. "312 ms" or "1.4 s", in the viewer's locale.
export const formatMilliseconds = (intl, ms) => {
  if (ms === undefined || ms === null || ms < 0) return '';
  if (ms < 1000) {
    return intl.formatNumber(Math.round(ms), { style: 'unit', unit: 'millisecond', unitDisplay: 'short' });
  }
  return intl.formatNumber(ms / 1000, {
    style: 'unit', unit: 'second', unitDisplay: 'short', maximumFractionDigits: 1,
  });
};
