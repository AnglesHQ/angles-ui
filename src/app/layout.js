import 'rsuite/dist/rsuite.min.css';
import 'react-image-crop/dist/ReactCrop.css';
import '../styles/main.css';

import { Oswald } from 'next/font/google';

import Providers from './providers';
import Shell from '../components/layout/Shell';
import RuntimeConfigScript from './runtime-config-script';

// Wordmark face for the brand logo. `next/font` self-hosts the file at build
// time, so there is no runtime request to Google — no third-party dependency on
// the critical path and nothing to allow through a CSP. Exposed as a CSS
// variable so only `.brand-wordmark` uses it; body text keeps the system stack.
const oswald = Oswald({
    subsets: ['latin'],
    weight: ['600'],
    display: 'swap',
    variable: '--font-brand',
});

export const metadata = {
    title: 'Angles',
    description: 'Angles UI',
};

// The API URL is read from the environment on every request, so the layout must
// not be statically pre-rendered at build time.
export const dynamic = 'force-dynamic';

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={oswald.variable}>
            <head>
                <RuntimeConfigScript />
            </head>
            <body>
                <Providers>
                    <Shell>
                        {children}
                    </Shell>
                </Providers>
            </body>
        </html>
    );
}
