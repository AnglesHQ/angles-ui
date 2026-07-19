'use client';

import React from 'react';
import PageContainer from '../../components/common/PageContainer';
import ScreenshotLibraryPage from '../../components/pages/screenshot-library/ScreenshotLibraryPage';

export default function Page() {
    return (
        <PageContainer breadcrumbMessageId="page.screenshot-library.bread-crumb">
            <ScreenshotLibraryPage />
        </PageContainer>
    );
}
