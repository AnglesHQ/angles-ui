// Runtime configuration.
//
// `NEXT_PUBLIC_*` variables are inlined into the client bundle at build time, so
// they cannot be changed without rebuilding the image. The API URL has to be
// settable per-deployment, so instead the server reads `ANGLES_API_URL` on every
// request in the root layout and publishes it to the browser via
// `window.__ANGLES_CONFIG__` (see src/app/runtime-config-script.js).
//
// On the server we read the environment directly; in the browser we read the
// injected object.

export const DEFAULT_ANGLES_API_BASE_URL = 'http://localhost:3000';
export const DEFAULT_ANGLES_API_BASE_PATH = '/rest/api/v1.0';
    
export const RUNTIME_CONFIG_GLOBAL = '__ANGLES_CONFIG__';

export const getAnglesApiUrl = () => {
    if (typeof window !== 'undefined') {
        return window[RUNTIME_CONFIG_GLOBAL]?.anglesApiUrl || `${DEFAULT_ANGLES_API_BASE_URL}${DEFAULT_ANGLES_API_BASE_PATH}`;
    }
    return `${process.env.ANGLES_API_BASE_URL}${process.env.ANGLES_API_BASE_PATH}` || `${DEFAULT_ANGLES_API_BASE_URL}${DEFAULT_ANGLES_API_BASE_PATH}`;
};

export const getAnglesApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
        return window[RUNTIME_CONFIG_GLOBAL]?.anglesApiBaseUrl || DEFAULT_ANGLES_API_BASE_URL;
    }
    return process.env.ANGLES_API_BASE_URL || DEFAULT_ANGLES_API_BASE_URL;
};
