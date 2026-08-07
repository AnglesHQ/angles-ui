import { getAnglesApiUrl, RUNTIME_CONFIG_GLOBAL } from '../utils/runtime-config';

// Server component. Rendered before any client code runs so that
// `window.__ANGLES_CONFIG__` is populated by the time modules that read it
// (e.g. the axios base URL in Shell.js) execute.
export default function RuntimeConfigScript() {
    const config = { anglesApiUrl: getAnglesApiUrl() };
    return (
        <script
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
                __html: `window.${RUNTIME_CONFIG_GLOBAL}=${JSON.stringify(config).replace(/</g, '\\u003c')};`,
            }}
        />
    );
}
