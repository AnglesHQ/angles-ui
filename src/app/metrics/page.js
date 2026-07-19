'use client';

import React from 'react';
import PageContainer from '../../components/common/PageContainer';
import MetricsPage from '../../components/pages/metrics/MetricsPage';

export default function Page() {
    return (
        <PageContainer breadcrumbMessageId="page.metrics.bread-crumb">
            <MetricsPage />
        </PageContainer>
    );
}
