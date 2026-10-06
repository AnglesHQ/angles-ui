// Runtime configuration.
//
// `NEXT_PUBLIC_*` variables are inlined into the client bundle at build time, so
// they cannot be changed without rebuilding the image. The API URL has to be
// settable per-deployment, so instead the server reads `ANGLES_API_BASE_URL` and
// `ANGLES_API_BASE_PATH` on every request in the root layout and publishes them to
// the browser via `window.__ANGLES_CONFIG__` (see src/app/runtime-config-script.js).
//
// On the server we read the environment directly; in the browser we read the
// injected object. Every value the browser reads must be published by
// getBrowserRuntimeConfig below: one that is not silently falls back to localhost.

export const DEFAULT_ANGLES_API_BASE_URL = 'http://localhost:3000';
export const DEFAULT_ANGLES_API_BASE_PATH = '/rest/api/v1.0';

export const RUNTIME_CONFIG_GLOBAL = '__ANGLES_CONFIG__';

const readBrowserConfig = (key) => (
    typeof window !== 'undefined' ? window[RUNTIME_CONFIG_GLOBAL]?.[key] : undefined
);

// The API's origin (plus any path prefix it is served under), without the version path,
// e.g. `https://angles-api.example.com`. Used for links outside the versioned API (the
// Swagger docs) and for full-page navigations to it (an SSO login).
export const getAnglesApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
        return readBrowserConfig('anglesApiBaseUrl') || DEFAULT_ANGLES_API_BASE_URL;
    }
    return process.env.ANGLES_API_BASE_URL || DEFAULT_ANGLES_API_BASE_URL;
};

// The versioned API root that axios requests are made against.
export const getAnglesApiUrl = () => {
    if (typeof window !== 'undefined') {
        return readBrowserConfig('anglesApiUrl') || `${DEFAULT_ANGLES_API_BASE_URL}${DEFAULT_ANGLES_API_BASE_PATH}`;
    }
    return `${getAnglesApiBaseUrl()}${process.env.ANGLES_API_BASE_PATH || DEFAULT_ANGLES_API_BASE_PATH}`;
};

// What the server publishes to the browser. Server-side only.
export const getBrowserRuntimeConfig = () => ({
    anglesApiUrl: getAnglesApiUrl(),
    anglesApiBaseUrl: getAnglesApiBaseUrl(),
});
