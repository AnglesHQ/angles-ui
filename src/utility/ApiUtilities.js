// Extracts the most specific human-readable message from an axios error, regardless of
// which shape the Angles API used for it. The API is inconsistent by design across layers:
//   - express-validator failures ...... { errors: [ { msg, param, ... } ] }
//   - hand-written route guards ........ { error: "..." }
//   - the shared handleError() helper .. { message: "..." }
// Reading only one of these (as the pages previously did) silently swallows the others and
// falls back to a generic message. This checks all three, in order of specificity.
export const getApiErrorMessage = (error, fallback) => {
  const data = error && error.response && error.response.data;
  if (data) {
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const messages = data.errors
        .map((e) => (e && (e.msg || e.message)))
        .filter(Boolean);
      if (messages.length > 0) {
        return messages.join(' ');
      }
    }
    if (typeof data.error === 'string' && data.error.length > 0) {
      return data.error;
    }
    if (typeof data.message === 'string' && data.message.length > 0) {
      return data.message;
    }
  }
  return fallback;
};
