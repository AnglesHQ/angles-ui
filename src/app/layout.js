import 'rsuite/dist/rsuite.min.css';
import 'react-image-crop/dist/ReactCrop.css';
import '../styles/main.css';

import Providers from './providers';
import Shell from '../components/layout/Shell';

export const metadata = {
    title: 'Angles',
    description: 'Angles UI',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
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
