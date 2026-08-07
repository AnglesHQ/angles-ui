import 'rsuite/dist/rsuite.min.css';
import 'react-image-crop/dist/ReactCrop.css';
import '../styles/main.css';

import Providers from './providers';
import Shell from '../components/layout/Shell';
import RuntimeConfigScript from './runtime-config-script';

export const metadata = {
    title: 'Angles',
    description: 'Angles UI',
};

// The API URL is read from the environment on every request, so the layout must
// not be statically pre-rendered at build time.
export const dynamic = 'force-dynamic';

export default function RootLayout({ children }) {
    return (
        <html lang="en">
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
