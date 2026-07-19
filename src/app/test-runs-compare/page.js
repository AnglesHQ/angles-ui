'use client';

import React from 'react';
import PageContainer from '../../components/common/PageContainer';
import TestRunsComparePage from '../../components/pages/test-runs-compare/TestRunsComparePage';

export default function Page() {
    return (
        <PageContainer breadcrumbMessageId="page.test-run-compare.bread-crumb">
            <TestRunsComparePage />
        </PageContainer>
    );
}
