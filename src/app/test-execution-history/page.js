'use client';

import React from 'react';
import PageContainer from '../../components/common/PageContainer';
import TestExecutionHistoryPage from '../../components/pages/test-execution-history/TestExecutionHistoryPage';

export default function Page() {
    return (
        <PageContainer breadcrumbMessageId="page.test-execution-history.bread-crumb">
            <TestExecutionHistoryPage />
        </PageContainer>
    );
}
