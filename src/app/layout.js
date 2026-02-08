import 'rsuite/dist/rsuite.min.css';
import 'react-image-crop/dist/ReactCrop.css';
import '../styles/main.css';
import '../index.css';

import Providers from './providers';
import Shell from '../components/Shell';

export const metadata = {
    title: 'Angles',
    description: 'Angles UI',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link
                    rel="stylesheet"
                    href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"
                    integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO"
                    crossOrigin="anonymous"
                />
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
