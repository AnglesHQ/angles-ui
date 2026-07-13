// Client-side mirror of the backend password strength policy
// (angles/app/utils/password-policy.js). Keep the two in sync: this only improves UX by
// giving instant feedback - the API remains the source of truth and re-validates on submit.
export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_LENGTH = 100;

// Each rule maps to a react-intl message id, shown as a requirement the password must meet.
export const PASSWORD_RULES = [
  { messageId: 'password.policy.min-length', test: (v) => v.length >= PASSWORD_MIN_LENGTH },
  { messageId: 'password.policy.max-length', test: (v) => v.length <= PASSWORD_MAX_LENGTH },
  { messageId: 'password.policy.letter', test: (v) => /[A-Za-z]/.test(v) },
  { messageId: 'password.policy.uppercase', test: (v) => /[A-Z]/.test(v) },
  { messageId: 'password.policy.special', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

// Returns the message ids of every rule the password fails (empty array when compliant).
export const getPasswordViolations = (password) => PASSWORD_RULES
  .filter((rule) => !rule.test(String(password || '')))
  .map((rule) => rule.messageId);

export const isPasswordValid = (password) => getPasswordViolations(password).length === 0;
