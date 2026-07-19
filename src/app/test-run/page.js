'use client';

import React from 'react';
import PageContainer from '../../components/common/PageContainer';
import TestRunDetailsPage from '../../components/pages/test-run/TestRunDetailsPage';

export default function Page() {
    return (
        <PageContainer breadcrumbMessageId="page.test-run.bread-crumb">
            <TestRunDetailsPage />
        </PageContainer>
    );
}
