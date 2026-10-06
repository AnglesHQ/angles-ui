import { headers } from 'next/headers';
import { getBrowserRuntimeConfig, RUNTIME_CONFIG_GLOBAL } from '../utils/runtime-config';

// Server component. Rendered before any client code runs so that
// `window.__ANGLES_CONFIG__` is populated by the time modules that read it
// (e.g. the axios base URL in Shell.js) execute.
//
// Carries the request's CSP nonce (set by src/proxy.js); without it the policy blocks
// this inline script like any other.
export default async function RuntimeConfigScript() {
    const config = getBrowserRuntimeConfig();
    const nonce = (await headers()).get('x-nonce') || undefined;
    return (
        <script
            nonce={nonce}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
                __html: `window.${RUNTIME_CONFIG_GLOBAL}=${JSON.stringify(config).replace(/</g, '\\u003c')};`,
            }}
        />
    );
}
