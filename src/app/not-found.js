'use client';

import React from 'react';
import PageContainer from '../components/common/PageContainer';
import NotFoundPage from '../components/pages/not-found/NotFoundPage';

export default function NotFound() {
    return (
        <PageContainer breadcrumbMessageId="page.not-found.bread-crumb">
            <NotFoundPage />
        </PageContainer>
    );
}
