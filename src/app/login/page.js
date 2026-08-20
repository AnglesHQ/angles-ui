'use client';

import React, { Suspense } from 'react';
import LoginPage from '../../components/pages/login/LoginPage';

export default function Page() {
    // LoginPage reads the ?error=true the SSO callback redirects with, so it needs a
    // Suspense boundary around useSearchParams().
    return (
        <Suspense fallback={null}>
            <LoginPage />
        </Suspense>
    );
}
