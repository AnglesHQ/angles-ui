'use client';

import React from 'react';
import PageContainer from '../../components/common/PageContainer';
import AboutPage from '../../components/pages/about/AboutPage';
import AboutTable from '../../components/pages/about/AboutTable';

export default function Page() {
    return (
        <PageContainer breadcrumbMessageId="page.about.bread-crumb">
            <AboutPage />
            <AboutTable />
        </PageContainer>
    );
}
